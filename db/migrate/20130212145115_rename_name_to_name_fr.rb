class RenameNameToNameFr < ActiveRecord::Migration
  def change
   rename_column :categories, :name, :name_fr
  end
end
