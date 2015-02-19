# This migration comes from dune_balanced (originally 20140817195359)
class CreateDuneBalancedOrders < ActiveRecord::Migration
  def change
    create_table :dune_balanced_orders do |t|
      t.references :project, index: true, null: false
      t.string :href, null: false

      t.timestamps
    end
  end
end
