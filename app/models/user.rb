# == Schema Information
#
# Table name: users
#
#  id              :integer         not null, primary key
#  name            :string(255)
#  password_digest :string(255)
#  created_at      :datetime
#  updated_at      :datetime
#  email           :string(255)
#  first_name      :string(255)
#  last_name       :string(255)
#

class User < ActiveRecord::Base
  validates :name,  :presence => true, :uniqueness => true
  validates :email, :presence => true, :uniqueness => true 
  has_secure_password
  after_destroy :ensure_an_admin_remains
  
  private
    def ensure_an_admin_remains
      if User.count.zero?
        raise "Can't delete last user"
      end
    end
end
