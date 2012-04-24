require 'test_helper'

class OrderNotifierTest < ActionMailer::TestCase
  test "received" do
    mail = OrderNotifier.received(orders(:one))
    assert_equal "Thank you for Ordering a Becker Martin Handmade Instrument!", mail.subject
    assert_equal ["dave@example.org"], mail.to
    assert_equal ["programcodex@gmail.com"], mail.from
    assert_match /your recent order from Becker Martin Instruments/, mail.body.encoded
    # match means this must match part of what is in the body
    # equal means it must be exactly the same 
  end

  test "shipped" do
    mail = OrderNotifier.shipped(orders(:one))
    assert_equal "Your Becker Martin Instrument has shipped!", mail.subject
    assert_equal ["dave@example.org"], mail.to
    assert_equal ["programcodex@gmail.com"], mail.from
    assert_match /Becker Martin Order Shipped/, mail.body.encoded
    # match means this must match part of what is in the body 
  end

end
