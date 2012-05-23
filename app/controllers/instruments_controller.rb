class InstrumentsController < ApplicationController

  def update
    @instrument = Instrument.find(params[:id])
    case params[:step]
    when 'paint'
      @instrument.update_attributes(step: params[:step], construction: params[:construction], wood: params[:wood], headstock: params[:headstock], top: params[:top], trimlays: params[:trimlays])
      redirect_to controller: 'store', action: 'paint', id: @instrument.id 
    when 'neck'
      @instrument.update_attributes(step: params[:step], color: params[:color], finish: params[:finish])
      redirect_to controller: 'store', action: 'paint', id: @instrument.id
    when 'electronics'
      @instrument.update_attributes(step: params[:step], 
       neck: params[:neck],
       strings:         params[:strings], 
       "scale length" => params["scale-length"], 
       curvature:          params[:curvature], 
       fingerboard:     params[:fingerboard], frets:     params[:frets])
      redirect_to controller: 'store', action: 'paint', id: @instrument.id
    when 'accessories'
      @instrument.update_attributes(step: params[:step], pickups: params[:pickups],
      "acoustic pickups" =>    params["acoustic-pickup"],
      "computer pickups" =>    params["computer-pickup"],
       electronics: params[:electronics],
       hardware: params[:hardware] )
      redirect_to controller: 'store', action: 'paint', id: @instrument.id
    else 
      @instrument.update_attributes(step: params[:step],  :case => params[:case],
      "play pack" =>    params["play-pack"],
      insurance: params[:insurance])
      redirect_to controller: 'store', action: 'paint', id: @instrument.id
    end

  end


end