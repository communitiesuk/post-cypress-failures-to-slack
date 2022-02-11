import * as core from '@actions/core';
import { readFileSync, createReadStream } from 'fs';
import walkSync from 'walk-sync';
import { WebClient } from '@slack/web-api';

// most @actions toolkit packages have async methods
async function run() {
  try {
    const token = core.getInput('token')
    const channels = core.getInput('channels')
    const workdir = core.getInput('workdir') || 'cypress'
    const messageText =
      core.getInput('message-text') ||
      "A Cypress test just finished. I've placed the screenshots and videos in this thread. Good pie!"

    core.debug(`Token: ${token}`)
    core.debug(`Channels: ${channels}`)
    core.debug(`Message text: ${messageText}`)

    core.debug('Initializing slack SDK')
    const slack = new WebClient(core.getInput('token'))
    core.debug('Slack SDK initialized successfully')

    core.debug('Checking for videos and/or screenshots from cypress')
    const videos = walkSync(workdir, { globs: ['**/*.mp4'] })
    const screenshots = walkSync(workdir, { globs: ['**/*.png'] })
    const logs = walkSync(workdir, { globs: ['**/logs/*.json'] })

    core.info(`There were ${logs.length} errors based on the files present.`)
    if (logs.length > 0) {
      core.info(`The log files found were: ${logs.join(", ")}`)
    } else {
      core.debug('No failures found!')
      core.setOutput('result', 'No failures logged found so no action taken!')
      return
    }

    core.debug('Sending initial slack message')
    

    const failures = logs.map(path => JSON.parse(readFileSync(`${workdir}/${path}`)))

    const parseFailure =  failure => ({
      fullDescription: failure['testName'],
      message: failure['testError'],
      testFile: failure['specName'].split('%2F').slice(1).join('/')
    })

    const failuresText = ':fire: EPB Frontend smoke test failure'

    const failureBlocks = [{
      type: "header",
      text: {
        type: "plain_text",
        text: failuresText,
      }
    }].concat(
      failures
        .map(parseFailure)
        .map(failure => ({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Failed test*: ${failure['fullDescription']}
            *in test file*: ${failure['testFile']}
            
            \`${failure['message']}\``
          }
        }))
    ).concat([
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "View videos in :thread:"
        }
      }
    ])

    const result = await slack.chat.postMessage({
      text: failuresText,
      blocks: failureBlocks,
      channel: channels,
    })

    const failedSpecs = failures.map(parseFailure).map( failure => failure.testFile.split('/').slice(-1)[0])

    const failureVideos = videos.filter(video => failedSpecs.some(spec => video.includes(spec)) )

    const { ts: threadId, channel: channelId } = result

    if (failureVideos.length > 0) {
      core.debug('Uploading videos...')

      await Promise.all(
          failureVideos.map(async video => {
            core.debug(`Uploading ${video}`)

            await slack.files.upload({
              filename: video,
              file: createReadStream(`${workdir}/${video}`),
              thread_ts: threadId,
              channels: channelId
            })
          })
      )

      core.debug('...done!')
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
