/** Formats parsed failures as block components as per the Slack Block Kit @see https://api.slack.com/block-kit */
const formatFailuresAsBlocks = (failures, messageText, videoCount, screenshotCount) => ([{
  type: 'header',
  text: {
    type: 'plain_text',
    text: messageText
  }
}].concat(
  failures
    .map(failure => ([
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '📄'
          },
          {
            type: 'mrkdwn',
            text: `*File*: ${failure.testFile}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*failed test*: ${failure.fullDescription}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*message*: \`${failure.message.split('\n')[0]}\``
        }
      },
      {
        type: 'divider'
      }
    ]))
    .flat()
).concat([
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${videoCount === 1 ? 'One video' : `${videoCount} videos`} and ${screenshotCount === 1 ? 'one screenshot' : `${screenshotCount} screenshots`} in :thread:`
    }
  }
]))

module.exports = formatFailuresAsBlocks
