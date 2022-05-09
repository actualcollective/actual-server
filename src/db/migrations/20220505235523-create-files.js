'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Files', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      group_id: {
        type: Sequelize.STRING,
      },
      sync_version: {
        type: Sequelize.SMALLINT,
      },
      encrypt_meta: {
        type: Sequelize.TEXT,
      },
      encrypt_key_id: {
        type: Sequelize.TEXT,
      },
      encrypt_salt: {
        type: Sequelize.TEXT,
      },
      encrypt_test: {
        type: Sequelize.TEXT,
      },
      deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Files');
  },
};
