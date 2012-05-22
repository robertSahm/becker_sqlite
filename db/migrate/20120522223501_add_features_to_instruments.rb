class AddFeaturesToInstruments < ActiveRecord::Migration
  def up
    add_column :instruments,         :body_type_id, :integer
    add_column :instruments,              :type_of, :string
    add_column :instruments,        :feature_name1, :string
    add_column :instruments,  :option_description1, :string
    add_column :instruments,               :price1, :integer
    add_column :instruments,        :feature_name2, :string
    add_column :instruments,  :option_description2, :string
    add_column :instruments,               :price2, :integer
    add_column :instruments,        :feature_name3, :string
    add_column :instruments,  :option_description3, :string
    add_column :instruments,               :price3, :integer
    add_column :instruments,        :feature_name4, :string
    add_column :instruments,  :option_description4, :string
    add_column :instruments,               :price4, :integer
    add_column :instruments,        :feature_name5, :string
    add_column :instruments,  :option_description5, :string
    add_column :instruments,               :price5, :integer
    add_column :instruments,        :feature_name6, :string
    add_column :instruments,  :option_description6, :string
    add_column :instruments,               :price6, :integer
    add_column :instruments,        :feature_name7, :string
    add_column :instruments,  :option_description7, :string
    add_column :instruments,               :price7, :integer
    add_column :instruments,        :feature_name8, :string
    add_column :instruments,  :option_description8, :string
    add_column :instruments,               :price8, :integer
    add_column :instruments,        :feature_name9, :string
    add_column :instruments,  :option_description9, :string
    add_column :instruments,               :price9, :integer
    add_column :instruments,       :feature_name10, :string
    add_column :instruments, :option_description10, :string
    add_column :instruments,              :price10, :integer
    add_column :instruments,       :feature_name11, :string
    add_column :instruments, :option_description11, :string
    add_column :instruments,              :price11, :integer
    add_column :instruments,       :feature_name12, :string
    add_column :instruments, :option_description12, :string
    add_column :instruments,              :price12, :integer
    add_column :instruments,       :feature_name13, :string
    add_column :instruments, :option_description13, :string
    add_column :instruments,              :price13, :integer
    add_column :instruments,       :feature_name14, :string
    add_column :instruments, :option_description14, :string
    add_column :instruments,              :price14, :integer
    add_column :instruments,       :feature_name15, :string
    add_column :instruments, :option_description15, :string
    add_column :instruments,              :price15, :integer
    add_column :instruments,       :feature_name16, :string
    add_column :instruments, :option_description16, :string
    add_column :instruments,              :price16, :integer
    add_column :instruments,       :feature_name17, :string
    add_column :instruments, :option_description17, :string
    add_column :instruments,              :price17, :integer
    add_column :instruments,       :feature_name18, :string
    add_column :instruments, :option_description18, :string
    add_column :instruments,              :price18, :integer
    add_column :instruments,       :feature_name19, :string
    add_column :instruments, :option_description19, :string
    add_column :instruments,              :price19, :integer
    add_column :instruments,       :feature_name20, :string
    add_column :instruments, :option_description20, :string
    add_column :instruments,              :price20, :integer
    add_column :instruments,       :feature_name21, :string
    add_column :instruments, :option_description21, :string
    add_column :instruments,              :price21, :integer
    add_column :instruments,       :feature_name22, :string
    add_column :instruments, :option_description22, :string
    add_column :instruments,              :price22, :integer
    add_column :instruments,       :feature_name23, :string
    add_column :instruments, :option_description23, :string
    add_column :instruments,              :price23, :integer
    add_column :instruments,       :feature_name24, :string
    add_column :instruments, :option_description24, :string
    add_column :instruments,              :price24, :integer
  end
  
  def down
    remove_column :instruments,         :body_type_id
    remove_column :instruments,              :type_of
    remove_column :instruments,        :feature_name1
    remove_column :instruments,  :option_description1
    remove_column :instruments,               :price1
    remove_column :instruments,        :feature_name2
    remove_column :instruments,  :option_description2
    remove_column :instruments,               :price2
    remove_column :instruments,        :feature_name3
    remove_column :instruments,  :option_description3
    remove_column :instruments,               :price3
    remove_column :instruments,        :feature_name4
    remove_column :instruments,  :option_description4
    remove_column :instruments,               :price4
    remove_column :instruments,        :feature_name5
    remove_column :instruments,  :option_description5
    remove_column :instruments,               :price5
    remove_column :instruments,        :feature_name6
    remove_column :instruments,  :option_description6
    remove_column :instruments,               :price6
    remove_column :instruments,        :feature_name7
    remove_column :instruments,  :option_description7
    remove_column :instruments,               :price7
    remove_column :instruments,        :feature_name8
    remove_column :instruments,  :option_description8
    remove_column :instruments,               :price8
    remove_column :instruments,        :feature_name9
    remove_column :instruments,  :option_description9
    remove_column :instruments,               :price9
    remove_column :instruments,       :feature_name10
    remove_column :instruments, :option_description10
    remove_column :instruments,              :price10
    remove_column :instruments,       :feature_name11
    remove_column :instruments, :option_description11
    remove_column :instruments,              :price11
    remove_column :instruments,       :feature_name12
    remove_column :instruments, :option_description12
    remove_column :instruments,              :price12
    remove_column :instruments,       :feature_name13
    remove_column :instruments, :option_description13
    remove_column :instruments,              :price13
    remove_column :instruments,       :feature_name14
    remove_column :instruments, :option_description14
    remove_column :instruments,              :price14
    remove_column :instruments,       :feature_name15
    remove_column :instruments, :option_description15
    remove_column :instruments,              :price15
    remove_column :instruments,       :feature_name16
    remove_column :instruments, :option_description16
    remove_column :instruments,              :price16
    remove_column :instruments,       :feature_name17
    remove_column :instruments, :option_description17
    remove_column :instruments,              :price17
    remove_column :instruments,       :feature_name18
    remove_column :instruments, :option_description18
    remove_column :instruments,              :price18
    remove_column :instruments,       :feature_name19
    remove_column :instruments, :option_description19
    remove_column :instruments,              :price19
    remove_column :instruments,       :feature_name20
    remove_column :instruments, :option_description20
    remove_column :instruments,              :price20
    remove_column :instruments,       :feature_name21
    remove_column :instruments, :option_description21
    remove_column :instruments,              :price21
    remove_column :instruments,       :feature_name22
    remove_column :instruments, :option_description22
    remove_column :instruments,              :price22
    remove_column :instruments,       :feature_name23
    remove_column :instruments, :option_description23
    remove_column :instruments,              :price23
    remove_column :instruments,       :feature_name24
    remove_column :instruments, :option_description24
    remove_column :instruments,              :price24
  end                                             
end                                               
