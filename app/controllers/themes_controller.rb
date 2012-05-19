class ThemesController < ApplicationController

  def index
    @themes = Theme.order("position ASC")
    @features = Feature.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @themes }
    end
  end

  def show
    @theme = Theme.find(params[:id])
    @body_types = @theme.body_types

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @theme }
    end
  end

  def new
    @theme = Theme.new
    @body_types = BodyType.all

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @theme }
    end
  end

  def edit
    @theme = Theme.find(params[:id])
    @body_types = BodyType.all
  end

  def create
    @theme = Theme.new(params[:theme])

    respond_to do |format|
      if @theme.save
        format.html { redirect_to @theme, notice: 'Theme was successfully created.' }
        format.json { render json: @theme, status: :created, location: @theme }
      else
        format.html { render action: "new" }
        format.json { render json: @theme.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @theme = Theme.find(params[:id])

    respond_to do |format|
      if @theme.update_attributes(params[:theme])
        format.html { redirect_to themes_path, notice: 'Theme was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @theme.errors, status: :unprocessable_entity }
      end
    end
  end
  
  def sort
    params[:theme].each_with_index do |id, index|
      Theme.update_all({position: index}, {id: id})
    end
    render nothing: true
  end

  def delete
    @theme = Theme.find(params[:id])
    @theme.destroy

    respond_to do |format|
      format.html { redirect_to themes_url }
      format.json { head :ok }
    end
  end
end
