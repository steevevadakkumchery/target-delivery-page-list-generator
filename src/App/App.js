import { useState, useEffect } from 'react'
import './App.css';

const ENV = {
  prod: 'https://www.vodafone.co.uk',
  plive: 'https://plive2-www.vodafone.co.uk',
  prodsup: 'https://shop.dx-prodsup-blue.internal.vodafoneaws.co.uk',
  qc2: 'https://shop.dx-qc2-blue.internal.vodafoneaws.co.uk',
  qc1: 'https://shop.dx-qc1-blue.internal.vodafoneaws.co.uk',
  int1: 'https://shop.dx-int1-blue.internal.vodafoneaws.co.uk',
  dev1: 'https://shop.dx-dev1-blue.internal.vodafoneaws.co.uk',
  tcc6: 'https://tcc6-www.vodafone.co.uk',
  tcc8: 'https://tcc8-www.vodafone.co.uk',
  tcc9: 'https://tcc9-www.vodafone.co.uk',
}

const CONSUMER_URL = 'mobile/phones/pay-monthly-contracts'
const BUSINESS_URL = 'business/business-mobile-phones/pay-monthly-contracts'

function App() {
  const [ filteredList, setFilteredList ] = useState([])
  const [ filterOptions, setFilterOptions ] = useState({})
  const [ filterModalOpen, setFilterModalOpen ] = useState(false)
  const [ selectedEnv, setSelectedEnv ] = useState(ENV.prod)
  const [ loading, setLoading ] = useState(false)

  useEffect(() => {
      setLoading(true)
      getListOfDevices()
  }, [])

  const getListOfDevices = async () => {
    const data = await fetch(`/api/`)
    const dataJson = await data.json()
    const initialFilterOptions = getFilterOptions(dataJson)
    setFilterOptions(initialFilterOptions)
    setFilteredList(dataJson)
    setLoading(false)
  }

  const getModelKey = (make, model) => `${make}/${model}`

  const getFilterOptions = (data) => {
    const allbrands = data.reduce((acc, { make }) => {
      const newAcc = { ...acc }
      if(!newAcc[make]){
        newAcc[make] = { selected: true, disabled: false }
      }
      return newAcc
    }, {})

    const allDevices = data.reduce((acc, { model, make }) => {
      const newAcc = { ...acc }
      const modelKey = getModelKey(make, model)
      if(!newAcc[modelKey]){
        newAcc[modelKey] = { selected: true, disabled: false }
      }
      return newAcc
    }, {})

    return {
      brands: allbrands,
      devices: allDevices,
      business: true,
      consumer: true,
      pdp: true,
      grid: true,
      allGrid: false,
      allPDP: false,
    }
  }

  const getUrls = () => {
    const urls = filteredList.reduce((acc, { make, model }) => {
      const newAcc = {
        business:{
          grid: [...acc.business.grid],
          pdp: [...acc.business.pdp]
        },
        consumer:{
          grid: [...acc.consumer.grid],
          pdp: [...acc.consumer.pdp]
        }
      }

      const modelKey = getModelKey(make, model)
      if(filterOptions.brands[make].selected) {
        if(filterOptions.consumer && filterOptions.grid) {
          if(!newAcc.consumer.grid.includes(`${selectedEnv}/${CONSUMER_URL}/${make}`)){
            newAcc.consumer.grid.push(`${selectedEnv}/${CONSUMER_URL}/${make}`)
          }
        }
        if(filterOptions.business && filterOptions.grid) {
          if(!newAcc.business.grid.includes(`${selectedEnv}/${BUSINESS_URL}/${make}`)) {
            newAcc.business.grid.push(`${selectedEnv}/${BUSINESS_URL}/${make}`)
          }
        }
      }

      if(filterOptions.brands[make].selected && filterOptions.devices[modelKey].selected) {
        if(filterOptions.pdp) {
          if(filterOptions.consumer) {
            newAcc.consumer.pdp.push(`${selectedEnv}/${CONSUMER_URL}/${make}/${model}`)
          }
          if(filterOptions.business) {
            newAcc.business.pdp.push(`${selectedEnv}/${BUSINESS_URL}/${make}/${model}`)
          }
        }
      }

      return newAcc
    }, {
      business: {
        grid: [],
        pdp: []
      },
      consumer: {
        grid: [],
        pdp: []
      }
    })

    return urls
  }

  const businessLinks = () => {
    const gridLinks = getUrls().business.grid.map((url) => <span key={url}>{url}</span>)
    const pdpLinks = getUrls().business.pdp.map((url) => <span key={url}>{url}</span>)
    return [...gridLinks, ...pdpLinks]
  }

  const consumerLinks = () => {
    const gridLinks = getUrls().consumer.grid.map((url) => <span key={url}>{url}</span>)
    const pdpLinks = getUrls().consumer.pdp.map((url) => <span key={url}>{url}</span>)
    return [...gridLinks, ...pdpLinks]
  }

  return (
    <div className="App">
      <h1 className="App-header">
        Delivery Pages
      </h1>

      {!loading ? (
        <div className='filter-button'>
          <button onClick={() => setFilterModalOpen(true)}>Filter</button>
          <select onChange={(e) => {
            setSelectedEnv(ENV[e.target.value])
          }}>
            {Object.keys(ENV).map((env) => {
              return <option key={env}>{env}</option>
            })}
          </select>

        </div>
      ) : (
        <div>
          <h2>Loading . . .</h2>
        </div>
      )}

      <div className='delivery-page-list'>
        {consumerLinks().length ? (
          <>
            <h3>Consumer Delivery Pages</h3>
            {consumerLinks()}
          </>
        ) : null}
       
        {businessLinks().length ? (
          <>
            <h3>Busines Delivery Pages</h3>
            {businessLinks()}
          </>
        ) : null}
      
      </div>

      {filterModalOpen && (
        <div className='filter-modal-container'>
          <div className='filter-modal'>
            <button className='modal-close' onClick={() => setFilterModalOpen(false)}>Close</button>
            <h1>filter options</h1>
            <div className='filter-options'>
              <div>
                <h2>Brands</h2>
                <div>
                  {Object.keys(filterOptions.brands).map((brand) => {
                    const options = filterOptions.brands
                    return (
                      <div key={brand}>
                        <input
                          type="checkbox"
                          id={brand}
                          name="brand"
                          checked={options[brand].selected}
                          disabled={options[brand].disabled}
                          onChange={(e) => {
                            const newValue = e.target.checked
                            const newOptions = { ...filterOptions }
                            newOptions.brands[brand].selected = newValue
                            if(newValue === false){
                              for(const device in newOptions.devices) {
                                  if(device.includes(brand)){
                                    newOptions.devices[device].selected = false
                                  }
                              }
                            }
                            setFilterOptions(newOptions)
                          }}
                        />

                        <label htmlFor={brand}>{brand}</label>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h2>Devices</h2>
                <div>
                  {Object.keys(filterOptions.devices).map((device) => {
                    const options = filterOptions.devices
                    return (
                      <div key={device}>
                        <input
                          type="checkbox"
                          id={device}
                          name="device"
                          checked={options[device].selected}
                          disabled={options[device].disabled}
                          onChange={(e) => {
                            const newValue = e.target.checked
                            const newOptions = { ...filterOptions }
                            newOptions.devices[device].selected = newValue
                            if(newValue == true){
                              const brand = device.split('/')[0]
                              newOptions.brands[brand].selected = true
                            }

                            setFilterOptions(newOptions)
                          }}
                        />

                        <label htmlFor={device}>{device}</label>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                  <h2>Types</h2>
                  <div>
                    <div>
                      <input type="checkbox" id="business" name="business" checked={filterOptions.business}
                        onChange={(e) => {
                          const newValue = e.target.checked
                          const newOptions = { ...filterOptions }
                          newOptions.business = newValue
                          setFilterOptions(newOptions)
                        }}
                      />
                      <label htmlFor="business">Business</label>
                    </div>
                    <div>
                      <input type="checkbox" id="consumer" name="consumer" checked={filterOptions.consumer}
                        onChange={(e) => {
                          const newValue = e.target.checked
                          const newOptions = { ...filterOptions }
                          newOptions.consumer = newValue
                          setFilterOptions(newOptions)
                        }}
                      />
                      <label htmlFor="consumer">Consumer</label>
                    </div>
                    <div>
                      <input type="checkbox" id="pdp" name="pdp" checked={filterOptions.pdp}
                        onChange={(e) => {
                          const newValue = e.target.checked
                          const newOptions = { ...filterOptions }
                          newOptions.pdp = newValue
                          setFilterOptions(newOptions)
                        }}
                      />
                      <label htmlFor="pdp">PDP</label>
                    </div>
                    <div>
                      <input type="checkbox" id="grid" name="grid" checked={filterOptions.grid}
                        onChange={(e) => {
                          const newValue = e.target.checked
                          const newOptions = { ...filterOptions }
                          newOptions.grid = newValue
                          setFilterOptions(newOptions)
                        }}
                      />
                      <label htmlFor="grid">Grid List</label>
                    </div>
                    {/* <div>
                      <input type="checkbox" id="allGrid" name="allGrid" checked={filterOptions.allGrid}
                        onChange={(e) => {
                          const newValue = e.target.checked
                          const newOptions = { ...filterOptions }
                          newOptions.allGrid = newValue
                          for(const brand in newOptions.brands){
                            newOptions.brands[brand].disabled = newValue
                          }
                          setFilterOptions(newOptions)
                        }}
                      />
                      <label htmlFor="allGrid">All Grid List Preset</label>
                    </div> */}
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default App;
