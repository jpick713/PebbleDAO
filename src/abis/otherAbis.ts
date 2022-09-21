export const minERC20Abi = {
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'owner_',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'spender',
            type: 'address'
          }
        ],
        name: 'allowance',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'spender',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256'
          }
        ],
        name: 'approve',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool'
          }
        ],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '',
            type: 'address'
          }
        ],
        name: 'balanceOf',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'totalSupply',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'getReserves',
        outputs: [
          {
            internalType: 'uint112',
            name: '_reserve0',
            type: 'uint112'
          },
          {
            internalType: 'uint112',
            name: '_reserve1',
            type: 'uint112'
          },
          {
            internalType: 'uint32',
            name: '_blockTimestampLast',
            type: 'uint32'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ]
  }
  