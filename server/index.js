const express = require('express')
const { JSDOM } = require('jsdom')
const cors = require('cors')
const path = require('path');

const app = express()
app.use(cors())
app.use(express.static(path.join(__dirname, '../build')));

const PORT = process.env.PORT || 5000;


app.get('/api/', async (req, res) => {
  try {
    const url = 'https://www.vodafone.co.uk/mobile/phones/pay-monthly-contracts'
    const data = await getPageData(url)
    const processedData = getPageDeviceDetails(data.handsetList.deviceGroups)
    res.json(processedData)
    res.end()
  } catch(err) {
    res.statusMessage = url
    res.sendStatus(404)
    res.end()
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found'
  });
});
app.use((err, req, res) => {
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

app.listen(PORT, () => {
  console.log(`running on localhost:${PORT}`)
})

const BASE_PATH = 'https://www.vodafone.co.uk'

function getPageData(url) {
  if(!url.includes(BASE_PATH)) {
    return [{}]
  }

  const options = {
    runScripts: "dangerously",
    resources: "usable"
  };

  return new Promise((resolve, reject) => {
    JSDOM.fromURL(url, options).then(dom => {
      let counter = 0
      let timer = setInterval(() => {
        if(dom.window._hydratedData) {
          clearTimeout(timer)
          resolve(dom.window._hydratedData)
        } else {
          if(counter > 20) {
            clearTimeout(timer)
            reject('timed out')
          }
          counter++
        }
      }, 500)
    }).catch((err) => {
      console.log(err)
      reject(new Error('hello'))
    })
  })
}


function getPageDeviceDetails(devices) {
  const makeAndModels = devices.map(({ make, model, name }) => {
    return { make, model, name }
  })

  const sortedByModel = makeAndModels.sort((a, b) => {
    if (a.model < b.model) {
      return -1;
    }
    if (a.model > b.model) {
      return 1;
    }
  
    // names must be equal
    return 0;
  })

  const sortedByMake = sortedByModel.sort((a, b) => {
    if (a.make < b.make) {
      return -1;
    }
    if (a.make > b.make) {
      return 1;
    }
  
    // names must be equal
    return 0;
  })

  return sortedByMake
}