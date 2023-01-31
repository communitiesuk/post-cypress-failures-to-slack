const attachAssetsToSlackThread = async (videos, screenshots, slack, streamAsset, threadOpts, debugLog = () => {}) => {
  if (videos.length > 0) {
    debugLog('Uploading videos...')

    await slack.files.uploadV2({
      thread_ts: threadOpts.threadId,
      channel_id: threadOpts.channelId,
      file_uploads: await Promise.all(
        videos.map(async video => ({
          file: streamAsset(video),
          filename: video
        }))
      )
    })

    debugLog('...done!')
  }

  if (screenshots.length > 0) {
    debugLog('Uploading screenshots...')

    await slack.files.uploadV2({
      thread_ts: threadOpts.threadId,
      channel_id: threadOpts.channelId,
      file_uploads: await Promise.all(
        screenshots.map(async screenshot => ({
          file: streamAsset(screenshot),
          filename: screenshot
        }))
      )
    })

    debugLog('...done!')
  }
}

module.exports = attachAssetsToSlackThread
