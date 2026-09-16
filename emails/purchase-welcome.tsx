import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from '@react-email/components'

// Brand palette (email clients need literal values, tokens are not available here).
const IVORY = '#F9F6EF'
const GREEN_DEEP = '#164C3D'
const GREEN = '#1B5E4B'
const GOLD = '#B7791F'
const CHARCOAL = '#1F2933'
const SLATE = '#4B5563'
const WHITE = '#FFFFFF'

export function PurchaseWelcomeEmail({ appUrl = 'https://theblendbar.example' }: { appUrl?: string }) {
  return (
    <Html>
      <Head />
      <Preview>Your Conditioner Edition access is ready.</Preview>
      <Body style={{ backgroundColor: IVORY, fontFamily: 'Helvetica, Arial, sans-serif', color: CHARCOAL, padding: '32px 12px', margin: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto' }}>
          <Section style={{ backgroundColor: GREEN_DEEP, padding: '40px 32px' }}>
            <Text style={{ margin: 0, color: IVORY, fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 700 }}>The Blend Bar</Text>
            <div style={{ height: '1px', width: '48px', backgroundColor: GOLD, margin: '20px 0' }} />
            <Heading style={{ margin: 0, color: IVORY, fontSize: '30px', lineHeight: 1.15, fontFamily: 'Georgia, serif', fontWeight: 400 }}>
              Your Conditioner Edition is active.
            </Heading>
          </Section>

          <Section style={{ backgroundColor: WHITE, padding: '32px' }}>
            <Text style={{ margin: '0 0 16px', fontSize: '16px', lineHeight: 1.7, color: CHARCOAL }}>
              Thank you for joining The Blend Bar. Your access has been confirmed and your space is ready.
            </Text>
            <Text style={{ margin: '0 0 24px', fontSize: '16px', lineHeight: 1.7, color: SLATE }}>
              Start with your Hair Need Journey. It takes a few minutes, and it shapes the Blend Brief you will use in the workshop.
            </Text>
            <Link
              href={`${appUrl}/my-blend-bar`}
              style={{ display: 'inline-block', backgroundColor: GREEN, color: WHITE, padding: '16px 28px', fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}
            >
              Enter My Blend Bar
            </Link>
          </Section>

          <Section style={{ padding: '24px 32px' }}>
            <Text style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: SLATE }}>
              Educational formulation experience. The Blend Bar does not diagnose or treat medical conditions.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default PurchaseWelcomeEmail
