/* eslint-disable */
import type { BaseTranslation } from '@i18n'

const en = {
    STARBOARD: {
        STAR_SLC_CHAN: {
            MESSAGE: 'Please select a channel first !'
        },
        STAR_CHAN_SET: {
            MESSAGE: 'Starboard channel set!'
        },
        STAR_CFG_UPDATED: {
            MESSAGE: 'Starboard config updated !'

        },
        STAR_ERR_EMOJI: {
            MESSAGE: 'Please provide a correct emoji (please do not use combined emoji) !'
        },
        STAR_ERR_PARAM: {
            MESSAGE: 'Please provide at least one parameter !'
        },
        STAR_ERR_GUILD: {
            MESSAGE: 'This command must be use inside a guild !'
        },
        STAR_MIN_EMOJI: {
            DESCRIPTION: 'Set the minimum number of stars to be displayed'
        },
        STAR_SET_EMOJI: {
            DESCRIPTION: 'Set the emoji to use for the starboard'
        },
        STAR_SET_CHAN: {
            DESCRIPTION: 'Set the channel to use for the starboard'
        },

        STAR_DESC: {
            DESCRIPTION: 'Set the starboard channel'
        },

    },

} satisfies BaseTranslation

export default en
