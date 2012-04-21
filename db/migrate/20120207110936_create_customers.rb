class CreateCustomers < ActiveRecord::Migration
  def change
    create_table :customers do |t|
      t.string :username
      t.string :hash_password
      t.string :salt

      t.string :ipaddress                 #  inet means IP4 or IP6 in postgresql data type

      t.timestamps
    end
  end
end
