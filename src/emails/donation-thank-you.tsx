import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface DonationThankYouEmailProps {
  donorName?: string
  amount: number
  currentTotal: number
  goalAmount: number
  theme?: 'light' | 'dark'
}

export const DonationThankYouEmail = ({
  donorName,
  amount,
  currentTotal,
  goalAmount,
  theme = 'dark',
}: DonationThankYouEmailProps) => {
  const progressPercentage = Math.min((currentTotal / goalAmount) * 100, 100)
  const remaining = Math.max(goalAmount - currentTotal, 0)
  const isDark = theme === 'dark'
  
  // Dynamic styles based on theme
  const dynamicH2 = isDark ? h2Dark : h2
  const dynamicText = isDark ? textDark : text
  const dynamicProgressContainer = isDark ? progressContainerDark : progressContainer
  const dynamicProgressBar = isDark ? progressBarDark : progressBar

  return (
    <Html>
      <Head />
      <Preview>Thank you for supporting Family Tree! 💚</Preview>
      <Body style={{
        backgroundColor: isDark ? '#1a1a1a' : '#f6f9fc',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
      }}>
        <Container style={{
          backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
          margin: '0 auto',
          padding: '20px 0 48px',
          marginBottom: '64px',
          maxWidth: '600px',
        }}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Family Tree</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={{
              color: isDark ? '#e5e7eb' : '#1a1a1a',
              fontSize: '24px',
              fontWeight: '600',
              lineHeight: '1.4',
              margin: '0 0 16px',
            }}>
              Thank You{donorName ? `, ${donorName}` : ''}! 💚
            </Heading>
            
            <Text style={{
              color: isDark ? '#d1d5db' : '#525252',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '16px 0',
            }}>
              Your generous donation of <strong style={highlight}>${amount}</strong> means the world to us!
            </Text>

            <Text style={{
              color: isDark ? '#d1d5db' : '#525252',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '16px 0',
            }}>
              Thanks to supporters like you, we've now raised <strong style={highlight}>${currentTotal.toFixed(0)}</strong> toward our ${goalAmount} goal.
            </Text>

            {/* Progress Bar */}
            <table style={{
              margin: '24px 0',
              padding: '16px',
              backgroundColor: isDark ? '#374151' : '#f9fafb',
              borderRadius: '8px',
            }} width="100%">
              <tr>
                <td>
                  <table style={{
                    height: '12px',
                    backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                    border: 'none',
                    borderCollapse: 'collapse',
                  }} cellPadding="0" cellSpacing="0" border={0}>
                    <tbody>
                      <tr>
                        {progressPercentage > 0 && (
                          <td style={{...progressFill, width: `${progressPercentage}%`}}>&nbsp;</td>
                        )}
                        {progressPercentage < 100 && (
                          <td style={{width: `${100 - progressPercentage}%`}}>&nbsp;</td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                  <Text style={progressText}>
                    {remaining > 0 
                      ? `Only $${remaining.toFixed(0)} left to reach our goal!`
                      : '🎉 Goal reached! Thank you for your support!'
                    }
                  </Text>
                </td>
              </tr>
            </table>

            <Hr style={hr} />

            <Text style={{
              color: isDark ? '#d1d5db' : '#525252',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '16px 0',
            }}>
              Your contribution helps us cover the costs of building and maintaining this app, keeping our family connected.
            </Text>

            <Text style={{
              color: isDark ? '#d1d5db' : '#525252',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '16px 0',
            }}>
              With gratitude,<br />
              <strong>The Family Tree Team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Family Tree - Keeping families connected
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default DonationThankYouEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const mainDark = {
  backgroundColor: '#1a1a1a',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const containerDark = {
  backgroundColor: '#2d2d2d',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 24px',
  background: 'linear-gradient(135deg, #A3D5A3 0%, #7FB57F 100%)',
  borderRadius: '12px 12px 0 0',
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
  padding: '0',
  textAlign: 'center' as const,
  fontFamily: 'Georgia, serif',
  fontStyle: 'italic',
}

const content = {
  padding: '24px',
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 16px',
}

const h2Dark = {
  color: '#e5e7eb',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 16px',
}

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
}

const textDark = {
  color: '#d1d5db',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
}

const highlight = {
  color: '#7FB57F',
  fontWeight: '700',
}

const progressContainer = {
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
}

const progressContainerDark = {
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#374151',
  borderRadius: '8px',
}

const progressBar = {
  height: '12px',
  backgroundColor: '#e5e7eb',
  borderRadius: '6px',
  overflow: 'hidden' as const,
  marginBottom: '8px',
  border: 'none',
  borderCollapse: 'collapse' as const,
}

const progressBarDark = {
  height: '12px',
  backgroundColor: '#4b5563',
  borderRadius: '6px',
  overflow: 'hidden' as const,
  marginBottom: '8px',
  border: 'none',
  borderCollapse: 'collapse' as const,
}

const progressFill = {
  height: '12px',
  backgroundColor: '#7FB57F',
  borderRadius: '6px',
  padding: '0',
  margin: '0',
}

const progressText = {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '8px 0 0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
}

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '1.5',
}
