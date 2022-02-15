const formatFailuresAsBlocks = require('../src/format-failures-as-blocks')

test('it formats failures as expected Slack Block Kit blocks', () => {
  const failures = [
    {
      fullDescription: 'Check that there aren\'t too many notes',
      message: 'There are too many notes',
      testFile: 'salieri_spec.js'
    },
    {
      fullDescription: 'Check again that there is the correct quantity of notes',
      message: 'There are, still, too many notes',
      testFile: 'salieri_reprise_spec.js'
    }
  ]
  const messageText = 'Salieri has his 👀 on u'

  expect(formatFailuresAsBlocks(failures, messageText, 3, 1)).toEqual([
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Salieri has his 👀 on u (2 failures)'
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '📄'
        },
        {
          type: 'mrkdwn',
          text: '*File*: *salieri_spec.js*'
        }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*failed test*: Check that there aren\'t too many notes'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*message*: `There are too many notes`'
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '📄'
        },
        {
          type: 'mrkdwn',
          text: '*File*: *salieri_reprise_spec.js*'
        }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*failed test*: Check again that there is the correct quantity of notes'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*message*: `There are, still, too many notes`'
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '3 videos and one screenshot in :thread:'
      }
    }
  ])
})

test('when there are no videos or screenshots it does not mention them or reference a thread', () => {
  const failures = [
    {
      fullDescription: 'Check that there aren\'t too many notes',
      message: 'There are too many notes',
      testFile: 'salieri_spec.js'
    },
    {
      fullDescription: 'Check again that there is the correct quantity of notes',
      message: 'There are, still, too many notes',
      testFile: 'salieri_reprise_spec.js'
    }
  ]
  const messageText = 'Salieri has his 👀 on u'

  expect(formatFailuresAsBlocks(failures, messageText, 0, 0)).toEqual([
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Salieri has his 👀 on u (2 failures)'
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '📄'
        },
        {
          type: 'mrkdwn',
          text: '*File*: *salieri_spec.js*'
        }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*failed test*: Check that there aren\'t too many notes'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*message*: `There are too many notes`'
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '📄'
        },
        {
          type: 'mrkdwn',
          text: '*File*: *salieri_reprise_spec.js*'
        }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*failed test*: Check again that there is the correct quantity of notes'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*message*: `There are, still, too many notes`'
      }
    }
  ])
})