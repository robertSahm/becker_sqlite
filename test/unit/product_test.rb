# == Schema Information
#
# Table name: products
#
#  id           :integer         not null, primary key
#  name         :string(255)
#  description  :text
#  image_url    :string(255)
#  price        :decimal(8, 2)
#  created_at   :datetime
#  updated_at   :datetime
#  type_of      :string(255)
#  feature      :string(255)
#  position     :integer
#  body_url     :string(255)
#  photo_url_1  :string(255)
#  photo_url_2  :string(255)
#  photo_url_3  :string(255)
#  photo_url_4  :string(255)
#  photo_url_5  :string(255)
#  photo_url_6  :string(255)
#  photo_url_7  :string(255)
#  photo_url_8  :string(255)
#  x_image_url  :string(255)
#  theme_id     :integer
#  body_type_id :integer
#  display      :boolean
#

require 'test_helper'

class ProductTest < ActiveSupport::TestCase
  fixtures :products
  
  test "product attributes must not be empty" do
    product = Product.new
    assert product.invalid?
    assert product.errors[:name].any?
    assert product.errors[:description].any?
    assert product.errors[:price].any?
    assert product.errors[:image_url].any?
  end

  test "product price must be positive" do
    product = Product.new(name:     "insturment",
                          description:     "yyy",
                          image_url:        "zzz.jpg")
    product.price = -1
    assert product.invalid?
    assert_equal "must be greater than or equal to 0.01",
      product.errors[:price].join('; ')

    product.price = 0
      assert product.invalid?
      assert_equal "must be greater than or equal to 0.01",
        product.errors[:price].join('; ')    

    product.price = 1
    assert product.valid?
  end

  def new_product(image_url)
    Product.new(name:     "insturment",
                description:     "yyy",
                price: 1,
                image_url:        image_url)
  end

  test "image url" do
    ok  = %w{ fred.gif fred.jpg fred.png FRED.JPG FRED.Jpg 
          http://a.b.c/x/y/z/fred.gif }
    bad = %w{ fred.doc fred.gif/more fred.gif.more }
    
    ok.each do |name|
      assert new_product(name).valid?, "#{name} shouldn't be invalid"
    end
    
    bad.each do |name|
      assert new_product(name).invalid?, "#{name} shouldn't be valid"
    end
  end
  
  test "product is   not valid without a unique name" do
    product = Product.new(name:     products(:ruby).name,
                          description:     "yyy",
                          price:           1,
                          image_url:        "zzz.jpg")
    assert !product.save
    assert_equal "has already been taken", product.errors[:name].join('; ')
  end
  


end












