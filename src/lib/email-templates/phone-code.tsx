import * as React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

export function PhoneCodeEmail({ code = '000000', phone = '' }: { code?: string; phone?: string }) {
  return (
    <Html>
      <Head />
      <Preview>MarketMitra verification code {code}</Preview>
      <Body style={{ backgroundColor: '#f6f7f5', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        <Container style={{ padding: '32px', backgroundColor: '#ffffff', borderRadius: '16px', margin: '24px auto', maxWidth: '480px' }}>
          <Heading style={{ fontSize: '20px', color: '#14532d' }}>Verify your mobile number</Heading>
          <Text style={{ fontSize: '14px', color: '#3f3f46' }}>
            Enter this code in MarketMitra to confirm {phone ? phone : 'your mobile number'} for Mitra Link.
          </Text>
          <Section style={{ margin: '24px 0', textAlign: 'center' }}>
            <Text style={{ fontSize: '32px', letterSpacing: '8px', fontWeight: 700, color: '#166534' }}>{code}</Text>
          </Section>
          <Text style={{ fontSize: '12px', color: '#71717a' }}>
            The code expires in 10 minutes. If you did not request it, ignore this email — your number stays unverified.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template: TemplateEntry = {
  component: PhoneCodeEmail,
  subject: 'Your MarketMitra verification code',
  displayName: 'Phone verification code',
  previewData: { code: '482913', phone: '+91 90000 00000' },
}
