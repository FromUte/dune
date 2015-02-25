class NonValidSubdomainConstraint
  def self.matches?(request)
    white_list = Channel.all.map(&:permalink)
    white_list << 'dune-investissement'
    return !white_list.include?(request.subdomain)
  end
end
