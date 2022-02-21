/** Formats parsed failures as block components as per the Slack Block Kit @see https://api.slack.com/block-kit */
const formatFailuresAsBlocks = (failures, messageText, videoCount, screenshotCount) => {
  const blocks = [{
    type: 'header',
    text: {
      type: 'plain_text',
      text: `${messageText} (${failures.length} failure${failures.length === 1 ? '' : 's'})`
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
              text: `*File*: *${failure.testFile}*`
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
            text: `*message*: \`${failure.message.split('\n')[0].replace(/`/g, '')}\``
          }
        },
        {
          type: 'divider'
        }
      ]))
      .flat()
  )

  if (videoCount > 0 || screenshotCount > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${videoCount === 1 ? 'One video' : `${videoCount} videos`} and ${screenshotCount === 1 ? 'one screenshot' : `${screenshotCount} screenshots`} in :thread:`
      }
    })
  } else {
    // pop off the last divider
    blocks.pop()
  }

  return blocks
}

module.exports = formatFailuresAsBlocks
