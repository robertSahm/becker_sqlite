class CreateBodyTypeFeatureJoinTable < ActiveRecord::Migration
  def up
    create_table :body_types_features, id: false do |t|
      t.integer :body_type_id
      t.integer :feature_id
    end
  end

  def down
    drop_table :body_type_features
  end
end
