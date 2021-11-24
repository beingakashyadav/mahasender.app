import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import FormControl from '@material-ui/core/FormControl'
import TextField from '@material-ui/core/TextField'
import Autocomplete, {
  createFilterOptions,
} from '@material-ui/lab/Autocomplete'
import { useDropzone } from 'react-dropzone'
import { Contract, ethers } from 'ethers'
import * as _ from 'underscore'
import useStateWithCallback from 'use-state-with-callback'
import useCore from '../../hooks/useCore'

import TextWrapper from '../../components/TextWrapper'
import SelectOption from '../../components/SelectOptiion'
import UploadIcon from '../../assets/icons/misc/UploadIcon.svg'
import Button from '../../components/Button'
import ImportCSV from '../../components/ImportCSV'
import AccountButton from '../../components/Navbar/components/AccountButton'
import ERC20 from '../../protocol/ERC20'
import ABIS from '../../protocol/deployments/abi'
import { useWallet } from 'use-wallet'
interface PrepareProps {
  handleNext: (adrs: []) => void
  selectedTokenFn: (token: any) => void
  setTokenFn: (token: any) => void
  setEnteredAdrsFn: (adrs: any) => void
  storedSelectedToken?: any
  storedEnteredAdrs?: any
}

const filter = createFilterOptions<any>()

function Prepare(props: PrepareProps) {
  const {
    handleNext,
    selectedTokenFn,
    storedSelectedToken,
    storedEnteredAdrs,
    setTokenFn,
    setEnteredAdrsFn,
  } = props

  const { account, connect } = useWallet()
  const core = useCore()

  const listOfTokens: ERC20[] = Object.keys(core.tokens).map((key) => {
    console.log('key', key)
    return core.tokens[key]
  })

  const stringTokens: any = listOfTokens?.map((item: any, i: number) => {
    return { address: item.address, symbol: item.symbol, decimal: item.decimal }
  })

  const InputOption = ['Upload File', 'Insert Manually']

  const [listOfAddresses, setListOfAddresses] = useState<any>([])
  const [enteredAdrs, setEnteredAdrs] = useState<any>(storedEnteredAdrs)
  const [addressError, setAddressError] = useState<any>([])
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone()
  const [addAdrsDropdown, setaddAdrsDropdown] = useState<string | null>(
    InputOption[1],
  )
  const [inputTokenValue, setInputTokenValue] = useState('')
  const [lineNumbers, setLineNumbers] = useState<number[]>([1])
  const [selectedToken, setSelectedToken] = useState<any>(storedSelectedToken)

  useEffect(() => {
    handleError()

    let list = listOfAddresses?.map((item: any) => {
      return `${item.adrs},${item.value}`
    })
    setEnteredAdrs(list.join('\n'))
    setEnteredAdrsFn(list.join('\n'))
  }, [listOfAddresses])

  useEffect(() => {
    if (storedEnteredAdrs?.length) {
      setEnteredAdrs(storedEnteredAdrs)
    }
  }, [storedEnteredAdrs])

  useEffect(() => {
    selectedTokenFn(selectedToken)
    setTokenFn(selectedToken)
  }, [selectedToken])

  const disableNextBtn =
    ethers.utils.isAddress(selectedToken?.address) &&
    addressError?.length === 0 &&
    listOfAddresses?.length !== 0

  console.log('disableNextBtn', disableNextBtn)

  const handleManualData = () => {
    let addresses: any[]
    addresses = []

    if (enteredAdrs.length > 0) {
      enteredAdrs.split(/\n/g).map((adrs: string, i: number) => {
        let indexOfComma = adrs.indexOf(',')
        let valueTobeSent = adrs.slice(indexOfComma + 1, adrs.length)

        addresses?.push({
          line: i + 1,
          adrs: `${adrs.slice(0, indexOfComma)}`,
          value: `${valueTobeSent}`,
        })
      })
      setListOfAddresses(addresses)
    }
  }

  const handleCSVData = (data: any) => {
    let addresses: any[]
    addresses = []
    data?.map((item: any, i: number) => {
      let indexOfComma = item?.indexOf(',')
      let valueTobeSent = item?.slice(indexOfComma + 1, item.length)

      addresses?.push({
        line: i + 1,
        adrs: `${item?.slice(0, indexOfComma)}`,
        value: `${valueTobeSent}`,
      })
    })

    setListOfAddresses(addresses)
  }

  const handleError = () => {
    listOfAddresses?.forEach((item: any, i: any, listOfAddresses: any) => {
      if (!ethers.utils.isAddress(item.adrs))
        setAddressError((prevArray: any) => [
          ...prevArray,
          {
            line: item.line,
            error: `${item.adrs} is invalid address`,
          },
        ])
      if (item.value <= 0 || isNaN(item.value))
        setAddressError((prevArray: any) => [
          ...prevArray,
          {
            line: item.line,
            error: `${item.value} is invalid value`,
          },
        ])

      for (let j = i + 1; j < listOfAddresses.length; j++) {
        if (item.adrs === listOfAddresses[j].adrs) {
          setAddressError((prevArray: any) => [
            ...prevArray,
            {
              line: listOfAddresses[j].line,
              error: `duplicate address ${listOfAddresses[j].adrs}`,
            },
          ])
        }
      }
    })
  }

  const deletedErrorRecords = () => {
    setListOfAddresses((items: any) => {
      return items?.filter((item: any) => {
        return _.where(addressError, { line: item.line }).length === 0
      })
    })
    setAddressError([])
  }

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      setLineNumbers([...lineNumbers, Number(lineNumbers.length + 1)])
    }
  }

  const filterTokenHandler = async (options: any, params: any) => {
    const filtered = filter(options, params)
    console.log('params', params)

    if (params.inputValue !== '' && !filtered.length) {
      if (ethers.utils.isAddress(params?.inputValue)) {
        const contractOfToken = await new Contract(
          params?.inputValue,
          ABIS['IERC20'],
          core.provider,
        )
        console.log('contractOfToken', contractOfToken)
        const decimal = await contractOfToken?.decimals()
        const symbol = await contractOfToken?.symbol()
        console.log('symbol', symbol)

        filtered.push(
          new ERC20(params?.inputValue, core.provider, symbol, decimal),
        )
      }
    }

    return filtered
  }

  console.log('selectedToken', selectedToken)

  console.log('listOfAddresses', listOfAddresses)

  return (
    <section>
      <div className={'row_spaceBetween_center marginB8'}>
        <div style={{ flex: 9, marginRight: '32px' }}>Token</div>
        <div style={{ flex: 1 }}>Decimal</div>
      </div>
      <div className={'row_spaceBetween_center marginB24'}>
        <div style={{ flex: 9, marginRight: '32px' }}>
          <Autocomplete
            value={selectedToken}
            onChange={async (e, token) => {
              console.log('token', token)
              setSelectedToken(token)
              // if (token && ethers.utils.isAddress(token.address)) {
              //   console.log('Here', token)
              //   const contractOfToken = await new Contract(
              //     token.address,
              //     ABIS['IERC20'],
              //     core.provider,
              //   )
              //   console.log('contractOfToken', contractOfToken)
              //   const decimal = await contractOfToken?.decimals()
              //   const symbol = await contractOfToken?.symbol()
              //   console.log('symbol', symbol)
              //   setSelectedToken(
              //     new ERC20(token.address, core.provider, symbol, decimal),
              //   )
              // }
            }}
            // filterOptions={(options, params) => {
            //   return filterTokenHandler(options, params)
            // }}
            id="combo-box-demo"
            options={stringTokens}
            getOptionLabel={(option: any) => {
              return `${option.symbol} - ${option.address}`
            }}
            getOptionSelected={(option, value) =>
              option.address === value.address
            }
            style={{ width: '100%', color: '#fff' }}
            freeSolo
            renderInput={(params: any) => (
              <TextField
                {...params}
                label=""
                variant="outlined"
                placeholder={'Select or insert token address you want to send'}
                style={{ color: '#fff' }}
              />
            )}
          />
        </div>
        <div style={{ flex: 1 }}>
          <FormControl
            style={{
              backgroundColor: '#151414',
              borderRadius: '5px',
            }}
          >
            <OutlinedInput
              id="outlined-adornment-weight"
              value={selectedToken?.decimal || 0}
              // onChange={(e) => {
              //   setDeciamText(e.target.value)
              // }}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
              labelWidth={0}
              className={'white_text'}
              disabled={true}
            />
          </FormControl>
        </div>
      </div>
      <div className={'row_spaceBetween_center marginB8'}>
        <div style={{ flex: 2 }}>Give addresses with Amounts</div>
        <div style={{ flex: 1 }}>
          <Autocomplete
            id="combo-box-demo"
            options={InputOption}
            value={addAdrsDropdown}
            onChange={(event: any, newValue: string | null) => {
              setaddAdrsDropdown(newValue)
            }}
            inputValue={inputTokenValue}
            onInputChange={(event, newInputValue) => {
              setInputTokenValue(newInputValue)
            }}
            getOptionLabel={(option: any) => option}
            style={{ width: '100%', color: '#fff' }}
            renderInput={(params: any) => (
              <TextField
                {...params}
                label=""
                variant="outlined"
                placeholder={'Select'}
                style={{ color: '#fff' }}
              />
            )}
          />
        </div>
      </div>

      <UploadFileContainer>
        {addAdrsDropdown === 'Upload File' ? (
          <div>
            <ImportCSV />
          </div>
        ) : (
          <div style={{ display: 'flex' }}>
            <div style={{ marginRight: '10px' }}>
              {lineNumbers.map((item: any, i: number) => (
                <TextWrapper
                  key={i}
                  text={`${item}`}
                  fontFamily={'Inter'}
                  fontWeight={300}
                  fontSize={14}
                  lineHeight={'140%'}
                  Fcolor={'rgba(255, 255, 255, 0.88)'}
                  className={'margin0 marginTB2'}
                />
              ))}
            </div>
            <textarea
              rows={6}
              value={enteredAdrs}
              onChange={(e) => {
                setEnteredAdrs(e.target.value)
              }}
              onBlur={handleManualData}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}
      </UploadFileContainer>
      <div className={'row_spaceBetween_center marginB42'}>
        <div>Accepted files : CSV, Excel, TXT</div>
        <div>Sample file</div>
      </div>

      {addressError.length ? (
        <section>
          <ErrorContainer>
            {addressError?.map((item: any, i: number) => (
              <ErrorText key={i}>
                Line&nbsp;{item.line} :&nbsp;{item.error}{' '}
              </ErrorText>
            ))}
          </ErrorContainer>
          <DeleteRecord onClick={() => deletedErrorRecords()}>
            Delete wrong records
          </DeleteRecord>
        </section>
      ) : null}

      {/* <AccountButton showWarning={showWarning} /> */}

      {!account ? (
        <Button
          text="Connect"
          tracking_id={'connect_wallet'}
          onClick={() => {
            connect('injected')
              .then(() => {
                localStorage.removeItem('disconnectWallet')
              })
              .catch((e) => {})
          }}
        />
      ) : (
        <Button
          text={'Next'}
          onClick={() => handleNext(listOfAddresses)}
          disabled={!disableNextBtn}
        />
      )}
    </section>
  )
}

export default Prepare

const UploadFileContainer = styled.div`
  background: #151414;
  border-radius: 6px;
  width: 100%;
  text-align: center;
  margin-bottom: 6px;
  padding: 12px 24px;
`

const TextAreaInputText = styled.div``

const ErrorContainer = styled.div`
  width: 100%;
  height: 92px;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 12px;
  overflow-y: auto;
`

const ErrorText = styled.div`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 300;
  font-size: 14px;
  line-height: 140%;
  color: #fa4c69;
`

const DeleteRecord = styled.div`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: #ff7f57;
  margin-bottom: 40px;
  cursor: pointer;
`
