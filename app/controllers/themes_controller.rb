class ThemesController < ApplicationController
  # GET /themes
  # GET /themes.json
  def index
    @themes = Theme.order("position ASC")

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @themes }
    end
  end

  # GET /themes/1
  # GET /themes/1.json
  def show
    @theme = Theme.find(params[:id])
    @body_types = @theme.body_types

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @theme }
    end
  end

  # GET /themes/new
  # GET /themes/new.json
  def new
    @theme = Theme.new
    @body_types = BodyType.all

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @theme }
    end
  end

  # GET /themes/1/edit
  def edit
    @theme = Theme.find(params[:id])
    @body_types = BodyType.all
  end

  # POST /themes
  # POST /themes.json
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

  # PUT /themes/1
  # PUT /themes/1.json
  def update
    @theme = Theme.find(params[:id])

    respond_to do |format|
      if @theme.update_attributes(params[:theme])
        format.html { redirect_to @theme, notice: 'Theme was successfully updated.' }
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

  # DELETE /themes/1
  # DELETE /themes/1.json
  def delete
    @theme = Theme.find(params[:id])
    @theme.destroy

    respond_to do |format|
      format.html { redirect_to themes_url }
      format.json { head :ok }
    end
  end
end
