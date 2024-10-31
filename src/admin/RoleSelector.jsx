import React from 'react';

const RoleSelector = ({ selectedRole, onChange }) => (
  <div className="role-selector-container">
    <label htmlFor="userType" className="role-label">Select Role:</label>
    <select
      id="userType"
      value={selectedRole}
      onChange={onChange}
      className="role-dropdown"
    >
      <option value="student">Students</option>
      <option value="teacher">Teachers</option>
      <option value="hod_dean">HOD/Dean</option>
    </select>
  </div>
);

export default RoleSelector;