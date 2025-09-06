import React from 'react';
import PageTransition from '../components/shared/PageTransition';
import FarmDataDebug from '../components/debug/FarmDataDebug';
import ComprehensiveDebug from '../components/debug/ComprehensiveDebug';
import SchemaTest from '../components/debug/SchemaTest';
import QuickCaseTest from '../components/debug/QuickCaseTest';
import RLSFix from '../components/debug/RLSFix';
import AIDatabaseTest from '../components/debug/AIDatabaseTest';
import SimpleAITest from '../components/debug/SimpleAITest';
import GeminiTest from '../components/debug/GeminiTest';
import DatabaseContextDebug from '../components/debug/DatabaseContextDebug';
import UserDataCheck from '../components/debug/UserDataCheck';
import MainAIAgentTest from '../components/debug/MainAIAgentTest';
import FieldReaderTest from '../components/debug/FieldReaderTest';
import ResponseConfigTest from '../components/debug/ResponseConfigTest';
import SoilDataChatbotTest from '../components/debug/SoilDataChatbotTest';
import SoilDataVerification from '../components/debug/SoilDataVerification';

export default function FarmDataDebugPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <SoilDataVerification />
        <SoilDataChatbotTest />
        <ResponseConfigTest />
        <FieldReaderTest />
        <MainAIAgentTest />
        <UserDataCheck />
        <DatabaseContextDebug />
        <GeminiTest />
        <SimpleAITest />
        <AIDatabaseTest />
        <RLSFix />
        <QuickCaseTest />
        <SchemaTest />
        <ComprehensiveDebug />
        <FarmDataDebug />
      </div>
    </PageTransition>
  );
}