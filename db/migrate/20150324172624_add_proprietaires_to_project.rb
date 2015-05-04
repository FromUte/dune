class AddProprietairesToProject < ActiveRecord::Migration
  def change
    add_column :projects, :pret_immo, :numeric, :null => false, default: 0
    add_column :projects, :autre_dette, :numeric, :null => false, default: 0
    add_column :projects, :pret_conso, :numeric, :null => false, default: 0
    add_column :projects, :type_estimation, :text, default: 'client'
    add_column :projects, :nature_bien, :text
    add_column :projects, :descriptif_bien, :text
    add_column :projects, :question_vente, :text
    add_column :projects, :question_rachat, :text
    add_column :projects, :loyer, :text
    add_column :projects, :mensualite, :text

    create_table :proprietaires do |t|
      t.belongs_to :project, index:true
      t.text :nom
      t.text :prenom
      t.date :date_naissance
      t.text :lieu_naissance
      t.text :situation_famille, default: 'celibataire'
      t.text :phone_mobile
      t.text :profession
      t.text :anciennete_profession
      t.integer :salaire_net
      t.text :type_contrat
      t.integer :autres_revenus
      t.timestamps null: false
    end
  end
end
