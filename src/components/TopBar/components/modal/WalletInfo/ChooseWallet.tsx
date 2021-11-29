import React from 'react'
import { useWallet } from 'use-wallet'
import styled from 'styled-components'

import Modal from '../../../../CustomModal'
import IconLoader from '../../../../IconLoader'
import TextWrapper from '../../../../TextWrapper'

import metamaskimg from '../../../../../assets/images/Metamask.svg'
import walletConnectimg from '../../../../../assets/images/walletConnect.png'

import { noOp } from '../../../../../utils/constants'
import { useAddPopup } from '../../../../../state/application/hooks'

interface Iprops {
  openModal: boolean
  onClose: () => void
}

const ChooseWallet = (props: Iprops) => {
  const { openModal, onClose } = props

  const addPopup = useAddPopup()
  const { connect, connector } = useWallet()

  const onMetaMaskClick = () => {
    if (connector === 'injected') return

    connect('injected')
      .then(() => {
        onClose()
      })
      .catch((e) => {
        console.log('error', e)
      })
  }

  const onWalletConnectClick = () => {
    if (connector === 'walletconnect') return

    connect('walletconnect')
      .then(() => {
        onClose()
      })
      .catch((e) => {
        console.log('error', e)
      })
  }

  return (
    <Modal
      open={openModal}
      handleClose={() => onClose()}
      title={'Connect a wallet to login'}
    >
      <Option
        className={`row_spaceBetween_center`}
        onClick={connector === 'injected' ? noOp : onMetaMaskClick}
      >
        <div className="flex_row_start_center">
          <img
            src={metamaskimg}
            width={40}
            alt={'metamask'}
            className="marginR12"
          />
          {<TextWrapper text={'Metamask'} fontSize={18} fontWeight={600} />}
        </div>
        {connector === 'injected' ? (
          <IconLoader iconName={'Copied'} />
        ) : (
          <IconLoader iconName={'ArrowTailRight'} iconType={'arrow'} />
        )}
      </Option>
      <Option
        onClick={
          connector === 'walletconnect' ? () => {} : onWalletConnectClick
        }
        className={`marginT16 row_spaceBetween_center ${
          connector === 'walletconnect' ? '' : 'pointer'
        }`}
      >
        <div className="flex_row_start_center">
          <img
            src={walletConnectimg}
            width={40}
            alt={'walletConnectimg'}
            className="marginR12"
          />
          <TextWrapper text={'WalletConnect'} fontSize={18} fontWeight={600} />
        </div>
        {connector === 'walletconnect' ? (
          <IconLoader iconName={'Copied'} />
        ) : (
          <IconLoader iconName={'ArrowTailRight'} iconType={'arrow'} />
        )}
      </Option>
    </Modal>
  )
}

export default ChooseWallet

const Option = styled.div`
  padding: 12px 24px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-sizing: border-box;
  border-radius: 6px;
`
