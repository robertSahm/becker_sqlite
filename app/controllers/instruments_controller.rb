class InstrumentsController < ApplicationController

  def update
    @instrument = Instrument.find(params[:id])

    respond_to do |format|
      if @instrument.update_attributes(params[:instrument])
        format.html { redirect_to controller: 'store', action: 'paint', id: @instrument.id }
        format.json { head :ok }
      else
        format.html { redirect_to controller: 'main', action: 'index'}
        format.json { render json: @instrument.errors, status: :unprocessable_entity }
      end
    end
    
  end


end