require 'test_helper'

class BodyTypesControllerTest < ActionController::TestCase
  setup do
    @body_type = body_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:body_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create body_type" do
    assert_difference('BodyType.count') do
      post :create, body_type: @body_type.attributes
    end

    assert_redirected_to body_type_path(assigns(:body_type))
  end

  test "should show body_type" do
    get :show, id: @body_type.to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @body_type.to_param
    assert_response :success
  end

  test "should update body_type" do
    put :update, id: @body_type.to_param, body_type: @body_type.attributes
    assert_redirected_to body_type_path(assigns(:body_type))
  end

  test "should destroy body_type" do
    assert_difference('BodyType.count', -1) do
      delete :destroy, id: @body_type.to_param
    end

    assert_redirected_to body_types_path
  end
end
