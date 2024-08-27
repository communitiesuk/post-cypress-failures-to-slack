const attachAssetsToSlackThread = async (videos, screenshots, slack, streamAsset, threadOpts, debugLog = () => {}) => {
  if (videos.length > 0) {
    console.log('Uploading videos...')

    await Promise.all(
      videos.map(async video => {
        debugLog(`Uploading ${video}`)

        await slack.files.uploadV2({
          filename: video,
          file: streamAsset(video),
          filetype: 'mp4',
          thread_ts: threadOpts.threadId,
          channel_id: threadOpts.channelId
        })
      })
    ).catch(e => console.log(e))

    console.log('...done!')
  }

  if (screenshots.length > 0) {
    console.log('Uploading screenshots...')

    await Promise.all(
      screenshots.map(async screenshot => {
        debugLog(`Uploading ${screenshot}`)

        await slack.files.uploadV2({
          filename: screenshot,
          file: streamAsset(screenshot),
          filetype: 'png',
          thread_ts: threadOpts.threadId,
          channel_id: threadOpts.channelId
        })
      })
    ).catch(e => console.log(e))

    console.log('...done!')
  }
}

module.exports = attachAssetsToSlackThread
