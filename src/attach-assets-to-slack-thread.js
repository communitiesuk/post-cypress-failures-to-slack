const attachAssetsToSlackThread = async (videos, screenshots, slack, streamAsset, threadOpts, debugLog = () => {}) => {
  if (videos.length > 0) {
    debugLog('Uploading videos...')

    const videoFiles = await Promise.all(
      videos.map(async video => ({
        file: streamAsset(video),
        filename: video
      }))
    )

    console.log(videoFiles)

    await slack.files.uploadV2({
      thread_ts: threadOpts.threadId,
      channel_id: threadOpts.channelId,
      file_uploads: videoFiles
    })

    debugLog('...done!')
  }

  if (screenshots.length > 0) {
    debugLog('Uploading screenshots...')

    const screenshotFiles = await Promise.all(
      screenshots.map(async screenshot => ({
        file: streamAsset(screenshot),
        filename: screenshot
      }))
    )

    console.log(screenshotFiles)

    await slack.files.uploadV2({
      thread_ts: threadOpts.threadId,
      channel_id: threadOpts.channelId,
      file_uploads: screenshotFiles
    })

    debugLog('...done!')
  }
}

module.exports = attachAssetsToSlackThread
