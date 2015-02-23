class MoveProjectsToArtAndRemoveOldCategories < ActiveRecord::Migration
  def up
    execute "
      UPDATE projects SET category_id = (SELECT id FROM categories WHERE name_fr = 'Arte') WHERE category_id = (SELECT id FROM categories WHERE name_fr = 'Feito à mão');
      UPDATE projects SET category_id = (SELECT id FROM categories WHERE name_fr = 'Arte') WHERE category_id = (SELECT id FROM categories WHERE name_fr = 'Graffiti');
      DELETE FROM categories WHERE name_fr = 'Feito à mão';
      DELETE FROM categories WHERE name_fr = 'Graffiti';
    "
  end

  def down
  end
end
