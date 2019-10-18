const fs = require('fs')
const resembleCompare = require('resemblejs/compareImages')
const getConfig = require('../core/getConfig')
const getFilePath = require('../core/getFilePath')
const createFolder = require('../core/createFolder')

const compareImages = (fileName, viewport) => {
  return new Promise(async (resolve, reject) => {
    const config = getConfig()

    try {
      const referenceImage = fs.readFileSync(getFilePath(config.paths.referenceImages, fileName, viewport))
      const testImage = fs.readFileSync(getFilePath(config.paths.testImages, fileName, viewport))

      const result = await resembleCompare(
        referenceImage,
        testImage,
        {
          ignore: 'nothing',
          scaleToSameSize: true,
          output: {
            largeImageThreshold: 0,
            transparency: 0.3
          }
        }
      )

      if (result.rawMisMatchPercentage > config.threshold) {
        await createFolder(`${config.paths.diffImages}/${fileName}`)
        const diffImagePath = getFilePath(config.paths.diffImages, fileName, viewport)
        fs.writeFileSync(diffImagePath, result.getBuffer())
        reject(new Error(`Images are not the same. See difference at ${diffImagePath}.`))
      } else {
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = compareImages