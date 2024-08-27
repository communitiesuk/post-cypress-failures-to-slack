const attachAssetsToSlackThread = async (videos, screenshots, slack, streamAsset, threadOpts, debugLog = () => {}) => {
  if (videos.length > 0) {
    debugLog('Uploading videos...')

    await Promise.all(
      videos.map(async video => {
        debugLog(`Uploading ${video}`)

        await slack.files.uploadV2({
          filename: video,
          file: streamAsset(video),
          thread_ts: threadOpts.threadId,
          channel_id: threadOpts.channelId
        })
      })
    )

    debugLog('...done!')
  }

  if (screenshots.length > 0) {
    debugLog('Uploading screenshots...')

    await Promise.all(
      screenshots.map(async screenshot => {
        debugLog(`Uploading ${screenshot}`)

        await slack.files.uploadV2({
          filename: screenshot,
          file: streamAsset(screenshot),
          thread_ts: threadOpts.threadId,
          channel_id: threadOpts.channelId
        })
      })
    )

    debugLog('...done!')
  }
}

module.exports = attachAssetsToSlackThread
