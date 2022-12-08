const rootPrefix = '../..',
  cronProcessesConstants = require(rootPrefix + '/lib/globalConstant/big/cronProcesses');

const cronSignature = {
  [cronProcessesConstants.bgJobProcessor]: {
    mandatory: [
      {
        parameter: 'topics',
        validatorMethods: ['validateArray']
      },
      {
        parameter: 'queues',
        validatorMethods: ['validateArray']
      },
      {
        parameter: 'prefetchCount',
        validatorMethods: ['validateNonZeroInteger']
      }
    ],
    optional: []
  },

  [cronProcessesConstants.cronProcessesMonitor]: {
    mandatory: [],
    optional: []
  },

  [cronProcessesConstants.socketJobProcessor]: {
    mandatory: [
      {
        parameter: 'topics',
        validatorMethods: ['validateArray']
      },
      {
        parameter: 'queues',
        validatorMethods: ['validateArray']
      },
      {
        parameter: 'prefetchCount',
        validatorMethods: ['validateNonZeroInteger']
      }
    ]
  },

  [cronProcessesConstants.fetchUserDetails]: {
    mandatory: [],
    optional: []
  },

  [cronProcessesConstants.smsHookProcessor]: {
    mandatory: [
      {
        parameter: 'sequenceNumber',
        validatorMethods: ['validateNonZeroInteger']
      }
    ],
    optional: [
      {
        parameter: 'processFailed',
        validatorMethods: ['validateBoolean']
      }
    ]
  },

  [cronProcessesConstants.emailServiceApiCallHookProcessor]: {
    mandatory: [
      {
        parameter: 'sequenceNumber',
        validatorMethods: ['validateNonZeroInteger']
      }
    ],
    optional: [
      {
        parameter: 'processFailed',
        validatorMethods: ['validateBoolean']
      }
    ]
  }
};

module.exports = cronSignature;
