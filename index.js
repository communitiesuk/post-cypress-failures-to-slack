import * as core from '@actions/core'
import { readFileSync, createReadStream } from 'fs'
import walkSync from 'walk-sync'
import { WebClient } from '@slack/web-api'
import formatFailuresAsBlocks from './src/format-failures-as-blocks'
import parseFailLog from './src/parse-fail-log'

// most @actions toolkit packages have async methods
async function run () {
  try {
    const token = core.getInput('token')
    const channels = core.getInput('channels')
    const workdir = core.getInput('workdir') || 'cypress'
    const messageText =
      core.getInput('message-text') ||
      'A Cypress test just finished. Errors follow. Any videos or screenshots are in this thread'

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
      core.info(`The log files found were: ${logs.join(', ')}`)
    } else {
      core.debug('No failures found!')
      core.setOutput('result', 'No failures logged found so no action taken!')
      return
    }

    const failures = parseFailLog(logs.map(path => readFileSync(`${workdir}/${path}`)))

    const failureBlocks = formatFailuresAsBlocks(failures, messageText, videos.length, screenshots.length)

    const result = await slack.chat.postMessage({
      text: messageText,
      blocks: failureBlocks,
      channel: channels
    })

    const failedSpecs = failures.map(failure => failure.testFile.split('/').slice(-1)[0])

    const failureVideos = videos.filter(video => failedSpecs.some(spec => video.includes(spec)))

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
            filename: screenshot,
            file: createReadStream(`${workdir}/${screenshot}`),
            thread_ts: threadId,
            channels: channelId
          })
        })
      )
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
