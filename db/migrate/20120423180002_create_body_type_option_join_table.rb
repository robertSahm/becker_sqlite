class CreateBodyTypeOptionJoinTable < ActiveRecord::Migration
  def up
    create_table :body_types_options, id: false do |t|
      t.integer :body_type_id
      t.integer :option_id
    end

  end

  def down
    drop_table :body_types_options
  end
end
