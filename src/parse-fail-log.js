const parseFailLog = files => {
  return files
    .map(JSON.parse)
    .map(failure => ({
      fullDescription: failure.testName,
      message: failure.testError,
      testFile: failure.specName.split('%2F').slice(1).join('/')
    }))
}

export default parseFailLog
