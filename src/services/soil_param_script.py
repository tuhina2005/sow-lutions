"""
Safe combined static + dynamic soil extractor - Python Version
- Extracts static soil properties from SoilGrids
- Extracts dynamic soil data from ERA5-Land and SMAP
- Saves results as structured JSON file
"""

import ee
import json

# Initialize Earth Engine
# Replace 'your-project-id' with your actual Google Cloud Project ID
try:
    ee.Initialize(project='sih-internal-snu')
    print('Earth Engine initialized successfully')
except Exception as e:
    print(f'Error initializing Earth Engine: {e}')
    print('Please run: earthengine authenticate')
    print('And replace "your-project-id" with your actual project ID')
    exit(1)

# ===== USER SETTINGS =====
AOI_MODE = 'buffer'  # 'buffer' or 'district'
BUFFER_RADIUS_M = 2000  # for buffer mode (meters)
VILLAGE_COORD = [75.983, 31.583]  # lon, lat for buffer mode
OUTPUT_JSON_PATH = 'soil_data_results.json'  # Output file path

# ===== DEFINE AOI =====
if AOI_MODE == 'district':
    gaul = ee.FeatureCollection("FAO/GAUL/2015/level2")
    aoi = gaul.filter(ee.Filter.And(
        ee.Filter.eq('ADM1_NAME', 'Punjab'),
        ee.Filter.eq('ADM2_NAME', 'Hoshiarpur')
    ))
    region_geometry = aoi.geometry()
    print('AOI: Hoshiarpur District, Punjab')
else:
    aoi = ee.Geometry.Point(VILLAGE_COORD).buffer(BUFFER_RADIUS_M)
    region_geometry = aoi
    print(f'AOI: Buffer of {BUFFER_RADIUS_M}m around point {VILLAGE_COORD}')

# ===== STATIC: SoilGrids (ISRIC) =====
sand_img = ee.Image('projects/soilgrids-isric/sand_mean')
silt_img = ee.Image('projects/soilgrids-isric/silt_mean')
clay_img = ee.Image('projects/soilgrids-isric/clay_mean')
soc_img = ee.Image('projects/soilgrids-isric/soc_mean')
bdod_img = ee.Image('projects/soilgrids-isric/bdod_mean')
ph_img = ee.Image('projects/soilgrids-isric/phh2o_mean')
cec_img = ee.Image('projects/soilgrids-isric/cec_mean')

# Depths list
depths_list = ee.List(['0-5cm', '5-15cm', '15-30cm', '30-60cm', '60-100cm', '100-200cm'])

# Properties to extract
prop_pairs = ee.List([
    ee.List([sand_img, 'sand']),
    ee.List([silt_img, 'silt']),
    ee.List([clay_img, 'clay']),
    ee.List([soc_img, 'soc']),
    ee.List([bdod_img, 'bdod']),
    ee.List([ph_img, 'phh2o']),
    ee.List([cec_img, 'cec'])
])

# Build static stats dictionary
def process_property(pair):
    pair = ee.List(pair)
    img = ee.Image(pair.get(0))
    pname = ee.String(pair.get(1))
    
    def process_depth(d):
        d = ee.String(d)
        src_band = pname.cat('_').cat(d).cat('_mean')
        dst_key = pname.cat('_').cat(d.replace('-', 'to'))
        available = img.bandNames()
        
        val = ee.Algorithms.If(
            available.contains(src_band),
            ee.Image(img.select(src_band)).reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=region_geometry,
                scale=250,
                maxPixels=1e13
            ).get(src_band),
            None
        )
        return ee.Dictionary().set(dst_key, val)
    
    per_depth = depths_list.map(process_depth)
    return per_depth

nested = prop_pairs.map(process_property)
flat = ee.List(nested).flatten()

def combine_dicts(dict_entry, acc):
    dict_entry = ee.Dictionary(dict_entry)
    acc = ee.Dictionary(acc)
    return acc.combine(dict_entry)

static_stats = ee.Dictionary(
    flat.iterate(combine_dicts, ee.Dictionary({}))
)

print('Static soil properties processed')

# ===== DYNAMIC: ERA5-Land & SMAP =====
era_col = ee.ImageCollection('ECMWF/ERA5_LAND/DAILY_AGGR')
last_era5 = era_col.sort('system:time_start', False).first()
era_available = era_col.size().gt(0)

# Candidate moisture bands
era_moist_candidates = ee.List([
    'volumetric_soil_water_layer_1',
    'volumetric_soil_water_layer_2',
    'swvl1',
])

def pick_first_available_band(image, candidates):
    candidates = ee.List(candidates)
    avail = image.bandNames()
    
    def check_band(b, acc):
        b = ee.String(b)
        acc = ee.String(acc)
        return ee.Algorithms.If(avail.contains(b), b, acc)
    
    pick = candidates.iterate(check_band, ee.String(''))
    pick = ee.String(pick)
    return ee.Algorithms.If(pick.length().gt(0), pick, None)

# ERA5 moisture stats
era_moist_band = ee.Algorithms.If(era_available, pick_first_available_band(last_era5, era_moist_candidates), None)

def compute_era_moist_stats():
    b = ee.String(era_moist_band)
    d = ee.Dictionary(last_era5.select(b).reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=region_geometry,
        scale=10000,
        maxPixels=1e13
    ))
    return d.set('ERA5_moisture_band', b)

era_moist_stats = ee.Algorithms.If(
    ee.Algorithms.IsEqual(era_moist_band, None),
    ee.Dictionary().set('ERA5_moisture_band', None).set('ERA5_moisture_value', None),
    compute_era_moist_stats()
)

# ERA5 temperature stats
era_temp_candidates = ee.List(['soil_temperature_level_1', 'skin_temperature'])
era_temp_band = ee.Algorithms.If(era_available, pick_first_available_band(last_era5, era_temp_candidates), None)

def compute_era_temp_stats():
    b2 = ee.String(era_temp_band)
    d2 = ee.Dictionary(last_era5.select(b2).reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=region_geometry,
        scale=10000,
        maxPixels=1e13
    ))
    return d2.set('ERA5_temp_band', b2)

era_temp_stats = ee.Algorithms.If(
    ee.Algorithms.IsEqual(era_temp_band, None),
    ee.Dictionary().set('ERA5_temp_band', None).set('ERA5_temp_value', None),
    compute_era_temp_stats()
)

# SMAP stats
smap_col = ee.ImageCollection('NASA/SMAP/SPL4SMGP/008')
last_smap = smap_col.sort('system:time_start', False).first()
smap_available = smap_col.size().gt(0)
smap_band = ee.Algorithms.If(smap_available,
    ee.Algorithms.If(last_smap.bandNames().contains('sm_surface'), 'sm_surface', None),
    None)

def compute_smap_stats():
    return ee.Dictionary(last_smap.select(ee.String(smap_band)).reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=region_geometry,
        scale=10000,
        maxPixels=1e13
    )).set('SMAP_sm_band', smap_band)

smap_stats = ee.Algorithms.If(
    ee.Algorithms.IsEqual(smap_band, None),
    ee.Dictionary().set('SMAP_sm_surface', None),
    compute_smap_stats()
)

print('Dynamic soil data processed')

# ===== COMBINE RESULTS WITH STRUCTURE =====
era_date = ee.Algorithms.If(era_available,
    ee.Date(last_era5.get('system:time_start')).format('YYYY-MM-dd'),
    'no_era5')
smap_date = ee.Algorithms.If(smap_available,
    ee.Date(last_smap.get('system:time_start')).format('YYYY-MM-dd'),
    'no_smap')

# Dynamic dictionary
dynamic_dict = ee.Dictionary({}) \
    .combine(era_moist_stats) \
    .combine(era_temp_stats) \
    .combine(smap_stats) \
    .set('ERA5_date', era_date) \
    .set('SMAP_date', smap_date)

# ===== ADD LOCATION INFO =====
if AOI_MODE == 'district':
    location_info = {
        "mode": "district",
        "state": "Punjab",
        "district": "Hoshiarpur"
    }
else:
    location_info = {
        "mode": "buffer",
        "coordinates": {
            "lon": VILLAGE_COORD[0],
            "lat": VILLAGE_COORD[1]
        },
        "buffer_m": BUFFER_RADIUS_M
    }

# Final structured dict
structured_dict = ee.Dictionary({
    'location': location_info,
    'dynamic': dynamic_dict,
    'static': static_stats
})

# ===== SAVE RESULTS AS JSON =====
def save_results_to_json(output_path=OUTPUT_JSON_PATH):
    """Save the structured soil data results to a JSON file."""
    try:
        print('Retrieving data from Earth Engine...')
        
        result_data = structured_dict.getInfo()
        
        with open(output_path, 'w') as f:
            json.dump(result_data, f, indent=2)
        
        print(f'Results successfully saved to: {output_path}')
        
        # Print summary
        if 'location' in result_data:
            print(f'Location: {result_data["location"]}')
        
        if 'static' in result_data:
            static_count = len(result_data['static'])
            print(f'Static parameters: {static_count}')
        
        if 'dynamic' in result_data:
            dynamic_count = len(result_data['dynamic'])
            print(f'Dynamic parameters: {dynamic_count}')
            
            if 'ERA5_date' in result_data['dynamic']:
                print(f'ERA5 data date: {result_data["dynamic"]["ERA5_date"]}')
            if 'SMAP_date' in result_data['dynamic']:
                print(f'SMAP data date: {result_data["dynamic"]["SMAP_date"]}')
        
        return result_data
    
    except Exception as e:
        print(f'Error saving results: {e}')
        return None

# Execute and save
json_results = save_results_to_json()
print('Script completed!')
