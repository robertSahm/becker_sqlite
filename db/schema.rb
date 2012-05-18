# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120518215642) do

  create_table "artists", :force => true do |t|
    t.string  "name"
    t.string  "band"
    t.text    "description"
    t.string  "image_url"
    t.string  "photo_url_1"
    t.string  "photo_url_2"
    t.string  "photo_url_3"
    t.string  "youtube_1"
    t.string  "youtube_2"
    t.string  "youtube_3"
    t.text    "note"
    t.string  "website"
    t.string  "facebook"
    t.string  "twitter"
    t.string  "instagram"
    t.string  "blog"
    t.integer "position"
  end

  create_table "body_types", :force => true do |t|
    t.string   "name"
    t.text     "description"
    t.string   "image_url"
    t.string   "x_image_url"
    t.integer  "position"
    t.string   "type_of"
    t.decimal  "price"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "display"
  end

  create_table "body_types_options", :id => false, :force => true do |t|
    t.integer "body_type_id"
    t.integer "option_id"
  end

  create_table "body_types_themes", :id => false, :force => true do |t|
    t.integer "body_type_id"
    t.integer "theme_id"
  end

  create_table "carts", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "customer_id"
  end

  create_table "checkouts", :force => true do |t|
    t.string   "first_name"
    t.string   "last_name"
    t.string   "phone"
    t.string   "email"
    t.string   "company"
    t.text     "address"
    t.string   "city"
    t.string   "state"
    t.string   "country",       :default => "US"
    t.string   "zip_code"
    t.text     "address_ship"
    t.string   "city_ship"
    t.string   "state_ship"
    t.string   "country_ship",  :default => "US"
    t.string   "zip_code_ship"
    t.string   "delivery_type"
    t.datetime "ship_date"
    t.integer  "customer_id"
    t.integer  "artist_id"
    t.integer  "product_id"
    t.text     "note"
    t.string   "pay_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "customers", :force => true do |t|
    t.string   "username"
    t.string   "hash_password"
    t.string   "salt"
    t.string   "ipaddress"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "features", :force => true do |t|
    t.string  "name"
    t.integer "position"
    t.string  "description"
  end

  create_table "instruments", :force => true do |t|
    t.integer  "artist_id"
    t.integer  "customer_id"
    t.integer  "line_item_id"
    t.text     "note"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "line_items", :force => true do |t|
    t.integer  "product_id"
    t.integer  "cart_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "quantity",                                   :default => 1
    t.decimal  "price",        :precision => 8, :scale => 2
    t.integer  "order_id"
    t.integer  "body_type_id"
    t.integer  "theme_id"
  end

  create_table "options", :force => true do |t|
    t.string  "description"
    t.decimal "price"
    t.integer "feature_id"
    t.boolean "default",      :default => false
    t.boolean "display",      :default => true
    t.integer "line_item_id"
    t.string  "type_of"
  end

  create_table "options_products", :id => false, :force => true do |t|
    t.integer "option_id"
    t.integer "product_id"
  end

  create_table "options_themes", :id => false, :force => true do |t|
    t.integer "option_id"
    t.integer "theme_id"
  end

  create_table "orders", :force => true do |t|
    t.string   "name"
    t.text     "address"
    t.string   "email"
    t.string   "pay_type"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.datetime "ship_date"
    t.integer  "customer_id"
    t.integer  "artist_id"
    t.text     "note"
  end

  create_table "products", :force => true do |t|
    t.string   "name"
    t.text     "description"
    t.string   "image_url"
    t.decimal  "price",        :precision => 8, :scale => 2
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "type_of"
    t.string   "feature"
    t.integer  "position"
    t.string   "body_url"
    t.string   "photo_url_1"
    t.string   "photo_url_2"
    t.string   "photo_url_3"
    t.string   "photo_url_4"
    t.string   "photo_url_5"
    t.string   "photo_url_6"
    t.string   "photo_url_7"
    t.string   "photo_url_8"
    t.string   "x_image_url"
    t.integer  "theme_id"
    t.integer  "body_type_id"
    t.boolean  "display"
  end

  create_table "themes", :force => true do |t|
    t.string   "name"
    t.string   "finish"
    t.string   "body"
    t.string   "color"
    t.string   "top"
    t.string   "neck"
    t.string   "headstock"
    t.string   "frets"
    t.string   "electronics"
    t.string   "hardware"
    t.decimal  "price",       :precision => 8, :scale => 2
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "image_url"
    t.string   "x_image_url"
    t.string   "thumb_url"
    t.integer  "position"
    t.text     "description"
    t.boolean  "display"
  end

  create_table "users", :force => true do |t|
    t.string   "name"
    t.string   "password_digest"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "email"
    t.string   "first_name"
    t.string   "last_name"
  end

end
