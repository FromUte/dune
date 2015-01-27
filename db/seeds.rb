# Disable sidekiq
require 'sidekiq/testing'
Sidekiq::Testing.fake!

puts 'Creating State entries...'

  [[name: 'Alsace', acronym: 'AL'],
  [name: 'Aquitaine', acronym: 'AQ'],
  [name: 'Auvergne', acronym: 'AV'],
  [name: 'Basse-Normandie', acronym: 'BN'],
  [name: 'Bourgogne', acronym: 'BG'],
  [name: 'Bretagne', acronym: 'BR'],
  [name: 'Centre', acronym: 'CT'],
  [name: 'Champagne-Ardenne', acronym: 'CA'],
  [name: 'Corse', acronym: 'CO'],
  [name: 'Franche-Comté', acronym: 'FC'],
  [name: 'Guadeloupe', acronym: 'GU'],
  [name: 'Guyane', acronym: 'GY'],
  [name: 'Haute-Normandie', acronym: 'HN'],
  [name: 'Ile-de-France', acronym: 'ID'],
  [name: 'La Réunion', acronym: 'RE'],
  [name: 'Languedoc-Roussillon', acronym: 'LR'],
  [name: 'Limousin', acronym: 'LI'],
  [name: 'Lorraine', acronym: 'LO'],
  [name: 'Martinique', acronym: 'MA'],
  [name: 'Mayotte', acronym: 'MY'],
  [name: 'Midi-Pyrénées', acronym: 'MP'],
  [name: 'Nord-Pas-de-Calais', acronym: 'NC'],
  [name: 'Pays de la Loire', acronym: 'PL'],
  [name: 'Picardie', acronym: 'PI'],
  [name: 'Poitou-Charentes', acronym: 'PC'],
  [name: 'Provence-Alpes Côte d''Azur', acronym: 'PA'],
  [name: 'Rhône-Alpes', acronym: 'RA']].each do |item|
    State.create! item
  end

puts '---------------------------------------------'
puts 'Done!'

puts 'Creating OauthProvider entries...'

  categories = %w{facebook twitter google_oauth2 linkedin}
  categories.each do |name|
    OauthProvider.create! name: name, path: name, secret: 'SOMETHING', key: 'SOMETHING'
  end

puts '---------------------------------------------'
puts 'Done!'


# puts 'Creating Category entries...'
#
#   categories = %w{Restauration}
#   categories.each do |c|
#     Category.create! name_fr: c, name_en: c
#   end

puts '---------------------------------------------'
puts 'Done!'

puts 'Creating Admin user...'
  u = User.new name: 'Admin',
               email: 'admin@admin.com',
               password: 'password'
  u.admin = true
  u.skip_confirmation!
  u.confirm!
  u.save

puts '---------------------------------------------'
puts 'Done!'

puts 'Creating system users...'

  # User to receive company contact notifications
  u = User.new email: Configuration[:email_contact].dup, password: SecureRandom.hex(4)
  u.skip_confirmation!
  u.confirm!
  u.save

  # User to receive new projects on draft notifications
  u = User.new email: Configuration[:email_projects].dup, password: SecureRandom.hex(4)
  u.skip_confirmation!
  u.confirm!
  u.save

puts '---------------------------------------------'
puts 'Done!'
