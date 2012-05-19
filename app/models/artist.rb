# == Schema Information
#
# Table name: artists
#
#  id          :integer         not null, primary key
#  name        :string(255)
#  band        :string(255)
#  description :text
#  image_url   :string(255)
#  photo_url_1 :string(255)
#  photo_url_2 :string(255)
#  photo_url_3 :string(255)
#  youtube_1   :string(255)
#  youtube_2   :string(255)
#  youtube_3   :string(255)
#  note        :text
#  website     :string(255)
#  facebook    :string(255)
#  twitter     :string(255)
#  instagram   :string(255)
#  blog        :string(255)
#  position    :integer
#

class Artist < ActiveRecord::Base
  acts_as_list
  has_many :instruments

end
