/**
 * @typedef {Object} Personnel
 * @property {string} user_id
 * @property {string} username
 * @property {string} full_name
 * @property {number} role_id
 */

/**
 * Personnel service for managing military personnel
 */
declare const personnelService: {
  /**
   * Get all personnel
   * @returns {Promise<Personnel[]>} Promise resolving to array of personnel
   */
  getPersonnel: () => Promise<any[]>;
};

export default personnelService;