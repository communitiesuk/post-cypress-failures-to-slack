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
      "A Cypress test just finished. Errors follow. Any videos or screenshots are in this thread"

    core.debug(`Token: ${token}`)
    core.debug(`Channels: ${channels}`)
    core.debug(`Message text: ${messageText}`)

    core.debug('Initializing slack SDK')
    const slack = new WebClient(core.getInput('token'))
    core.debug('Slack SDK initialized successfully')

    core.debug('Checking for videos and/or screenshots from cypress')
    const videos = walkSync(workdir, { globs: ['**/videos/**/*.mp4'] })
    const screenshots = walkSync(workdir, { globs: ['**/screenshots/**/*.png'] })
    const logs = walkSync(workdir, { globs: ['**/logs/*.json'] })

    core.info(`There were ${logs.length} errors based on the files present.`)
    if (logs.length > 0) {
      core.info(`The log files found were: ${logs.join(", ")}`)
    } else {
      core.debug('No failures found!')
      core.setOutput('result', 'No failures logged found so no action taken!')
      return
    }

    const failures = logs.map(path => JSON.parse(readFileSync(`${workdir}/${path}`)))

    const parseFailure =  failure => ({
      fullDescription: failure['testName'],
      message: failure['testError'],
      testFile: failure['specName'].split('%2F').slice(1).join('/')
    })

    const failureBlocks = [{
      type: "header",
      text: {
        type: "plain_text",
        text: messageText,
      }
    }].concat(
      failures
        .map(parseFailure)
        .map(failure => ([
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "📄",
              },
              {
                type: "mrkdwn",
                text: `*File*: ${failure['testFile']}`
              }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Failed test*: ${failure['fullDescription']}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*message*: \`${failure['message'].split("\n")[0]}\``
            }
          },
          {
            type: "divider",
          }
        ]))
        .flat()
    ).concat([
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Videos and screenshots in :thread:"
        }
      }
    ])

    const result = await slack.chat.postMessage({
      text: messageText,
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

    if (screenshots.length > 0) {
      core.debug('Uploading screenshots')

      await Promise.all(
        screenshots.map(async screenshot => {
          core.debug(`Uploading ${screenshot}`)

          await slack.files.upload({
            filename: video,
            file: createReadStream(`${workdir}/${screenshot}`),
            thread_ts: threadId,
            channels: channelId
          })
        })
    )
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
