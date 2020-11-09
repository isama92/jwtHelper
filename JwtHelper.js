import moment from 'moment';

class JwtHelper {
    /**
     * @constructor
     *
     * @param {string} prefix Prefix for localStorage keys
     * @param {number} expiringDiff When expiring is lower than this value start a refresh request
     */
    constructor(prefix = 'jwt', expiringDiff = 300) {
        this.labelAuthToken = `${prefix}_auth_token`;
        this.labelAuthInfo = `${prefix}_auth_info`;
        this.labelAuthExpiration = `${prefix}_auth_expiration`;
        this.authTokenStatusValid = `${prefix}_valid`;
        this.authTokenStatusExpiring = `${prefix}_expiring`;
        this.authTokenStatusExpired = `${prefix}_expired`;
        this.authExpiringDiff = expiringDiff;
    }

    /** AUTH_TOKEN */

    /**
     * Get auth token
     *
     * @public
     * @returns {string}
     */
    getAuthToken() {
        return localStorage.getItem(this.labelAuthToken);
    }

    /**
     * Remove auth token
     *
     * @public
     */
    removeAuthToken() {
        localStorage.removeItem(this.labelAuthToken);
    }

    /**
     * Set auth token
     *
     * @public
     * @param {string} authToken
     */
    setAuthToken(authToken) {
        localStorage.setItem(this.labelAuthToken, authToken);
    }

    /** AUTH_INFO */

    /**
     * Get auth info from local storage
     *
     * @public
     * @returns {object|null}
     */
    getAuthInfo() {
        const authInfo = localStorage.getItem(this.labelAuthInfo);
        return JSON.parse(authInfo);
    }

    /**
     * Remove auth info from local storage
     *
     * @public
     */
    removeAuthInfo() {
        localStorage.removeItem(this.labelAuthInfo);
    }

    /**
     * Set auth info in local storage
     *
     * @public
     * @param {object} authInfo
     */
    setAuthInfo(authInfo) {
        const strAuthInfo = JSON.stringify(authInfo);
        localStorage.setItem(this.labelAuthInfo, strAuthInfo);
    }

    /** AUTH_EXPIRATION */

    /**
     * Get auth expiration datetime
     *
     * @public
     * @returns {string}
     */
    getAuthExpiration() {
        return localStorage.getItem(this.labelAuthExpiration);
    }

    /**
     * Remove auth expiration
     *
     * @public
     */
    removeAuthExpiration() {
        localStorage.removeItem(this.labelAuthExpiration);
    }

    /**
     * Set auth expiration in datetime format
     *
     * @public
     * @param {number|moment|string} authExpiration Number is seconds, moment and string is date
     * @returns {boolean}
     */
    setAuthExpiration(authExpiration) {
        let strAuthExpiration;
        if (typeof authExpiration === 'number') {
            const m = moment().add(authExpiration, 's');
            strAuthExpiration = m.format('YYYY-MM-DD HH:mm:ss');
        } else if (moment.isMoment(authExpiration)) {
            strAuthExpiration = authExpiration.format('YYYY-MM-DD HH:mm:ss');
        } else if (typeof authExpiration === 'string') {
            const m = moment(authExpiration);
            if (!m.isValid()) return false;
            strAuthExpiration = m.format('YYYY-MM-DD HH:mm:ss');
        } else {
            return false;
        }

        localStorage.setItem(this.labelAuthExpiration, strAuthExpiration);
        return true;
    }

    /** ALL DATA */

    /**
     * Get all auth data
     *
     * @public
     * @returns {{authToken: string, authExpiration: string, info: object|null}}
     */
    getAuthData() {
        return {
            authToken: this.getAuthToken(),
            authExpiration: this.getAuthExpiration(),
            info: this.getAuthInfo(),
        };
    }

    /**
     * Remove auth data
     *
     * @public
     */
    removeAuthData() {
        this.removeAuthToken();
        this.removeAuthInfo();
        this.removeAuthExpiration();
    }

    /**
     * Set auth data
     *
     * @public
     * @param {string} authToken
     * @param {object} authInfo
     * @param {number|moment|string} authExpiration
     */
    setAuthData(authToken, authInfo, authExpiration) {
        this.refreshAuthToken(authToken, authExpiration);
        this.setAuthInfo(authInfo);
    }

    /**
     * Set the token after refresh
     *
     * @public
     * @param authToken
     * @param authExpiration
     */
    refreshAuthToken(authToken, authExpiration) {
        this.setAuthToken(authToken);

        if (authExpiration !== null && !this.setAuthExpiration(authExpiration)) {
            throw new Error('error while saving auth expiration');
        }
    }

    /**
     * Get auth token status
     *
     * @public
     * @returns {string} Return one of authTokenStatusExpired, authTokenStatusExpiring, authTokenStatusValid
     */
    getAuthTokenStatus() {
        const authExpiration = this.getAuthExpiration();

        if (!authExpiration) return this.authTokenStatusExpired;
        const expiration = this.getAuthTokenExpiringInterval();

        if (expiration < 0) {
            return this.authTokenStatusExpired;
        } if (expiration <= this.authExpiringDiff) {
            return this.authTokenStatusExpiring;
        }
        return this.authTokenStatusValid;
    }

    /**
     * Get auth token expiring moment interval
     *
     * @public
     * @returns {number} Seconds
     */
    getAuthTokenExpiringInterval() {
        const authExpiration = this.getAuthExpiration();
        if (!authExpiration) return 0;
        const now = moment();
        return moment(authExpiration).diff(now, 's');
    }
}

export default JwtHelper;
