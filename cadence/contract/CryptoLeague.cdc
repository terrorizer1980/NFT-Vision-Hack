import FungibleToken from './NonFungibleToken'

pub contract CryptoLeague {
  access(self) var templates: {UInt32: Template}
  access(self) var packs: @{UInt32: Pack}

  pub var nextTemplateID: UInt32
  pub var nextPackID: UInt32
  pub var totalCards: UInt64

  pub let CollectionStoragePath: StoragePath
  pub let CollectionPublicPath: PublicPath
  pub let AdminStoragePath: StoragePath


  pub struct Template {
    pub let templateID: UInt32
    pub let team: String
    pub let name: String
    pub let price: UFix64

    init(templateID: UInt32, team: String, name: String, price: UFix64) {
      self.templateID = templateID
      self.team = team
      self.name = name
      self.price = price
    }
  }

    pub resource Card {
    pub let id: UInt64
    pub let data: Template

    init(templateID: UInt32) {
      pre {
        CryptoLeague.templates[templateID] != nil : "Could not create card: template does not exist."
      }
      let card = CryptoLeague.templates[templateID]!
      CryptoLeague.totalCards = CryptoLeague.totalCards + 1
      self.id = CryptoLeague.totalCards
      self.data = Template(templateID: templateID, team: card.team, name: card.name, price: card.price)
    }
  }


  pub resource Pack {
    pub let name: String
    pub let packID: UInt32
    pub var templates: [UInt32]
    pub var price: UFix64
    
    init(name: String, price: UFix64) {
      pre {
        name.length > 0: "Could not create pack: name is required."
        price > 0.00 : "Could not create pack: price is required to be higher than 0."
      }
      self.name = name
      self.price = price
      self.packID = CryptoLeague.nextPackID
      self.templates = []
      CryptoLeague.nextPackID = CryptoLeague.nextPackID + 1
    }

    pub fun addTemplate(templateID: UInt32) {
      pre {CryptoLeague.templates[templateID] != nil : "Could not add card to pack: template does not exist."}
      self.templates.append(templateID)
    }

    pub fun mintCard(templateID: UInt32): @Card {
      pre {
        self.templates.contains(templateID): "Could not mint card: template does not exist."
        // !self.lazy[templateID]!: "Could not mint card: template has been retired."
      }
      return <- create Card(templateID: templateID)
    }
  }

    pub struct PackReport {
      pub let name: String
      pub let packID: UInt32
      pub var templates: [UInt32]
      pub var price: UFix64
    
      init(name: String, packID: UInt32, templates: [UInt32], price: UFix64) {
        self.name = name
        self.packID = packID
        self.templates = []
        self.price = price
      }
  }


  pub resource Admin {

    pub fun createTemplate(team: String, name: String, price: UFix64): UInt32 {
      pre {
        team.length > 0 : "Could not create template: team is required."
        name.length > 0 : "Could not create template: name is required."
      }
      let newCardID = CryptoLeague.nextTemplateID
      CryptoLeague.templates[newCardID] = Template(templateID: newCardID, team: team, name: name, price: price)
      CryptoLeague.nextTemplateID = CryptoLeague.nextTemplateID + 1
      return newCardID
    }

    pub fun destroyTemplate(cardID: UInt32) {
      pre {
        CryptoLeague.templates[cardID] != nil : "Could not delete template: template does not exist."
      }
      CryptoLeague.templates.remove(key: cardID)
    }

    pub fun createPack(name: String, price: UFix64) {
      let newPack <- create Pack(name: name, price: price)
      CryptoLeague.packs[newPack.packID] <-! newPack
    }

    pub fun borrowPack(packID: UInt32): &Pack {
      pre {
        CryptoLeague.packs[packID] != nil : "Could not borrow pack: pack does not exist."
      }
      return &CryptoLeague.packs[packID] as &Pack
    }

    pub fun destroypack(packID: UInt32) {
      pre {
        CryptoLeague.packs[packID] != nil : "Could not borrow pack: pack does not exist."
      }
      let packToDelete <- CryptoLeague.packs.remove(key: packID)!
      destroy packToDelete
    }
  }

  pub resource interface CollectionPublic {
    pub fun deposit(token: @Card)
    pub fun getIDs(): [UInt64]
    pub fun listCards(): {UInt64: Template}
  }

  pub resource interface Provider {
    pub fun withdraw(withdrawID: UInt64): @Card
  }

  pub resource interface Receiver{
    pub fun deposit(token: @Card)
    pub fun batchDeposit(collection: @Collection)
  }


  pub resource Collection:CollectionPublic,Provider,Receiver {
    pub var ownedNFTs: @{UInt64: Card}

    pub fun withdraw(withdrawID: UInt64): @Card {
      let token <- self.ownedNFTs.remove(key: withdrawID) 
        ?? panic("Could not withdraw card: card does not exist in collection")
      return <-token
    }

    pub fun deposit(token: @Card) {
      let oldToken <- self.ownedNFTs[token.id] <- token
      destroy oldToken
    }

    pub fun batchDeposit(collection: @Collection) {
      let keys = collection.getIDs()
      for key in keys {
        self.deposit(token: <-collection.withdraw(withdrawID: key))
      }
      destroy collection
    }

    pub fun getIDs(): [UInt64] {
      return self.ownedNFTs.keys
    }

    pub fun listCards(): {UInt64: Template} {
      var cardTemplates: {UInt64:Template} = {}
      for key in self.ownedNFTs.keys {
        let el = &self.ownedNFTs[key] as &Card
        cardTemplates.insert(key: el.id, el.data)
      }
      return cardTemplates
    }

    destroy() {
      destroy self.ownedNFTs
    }

    init() {
      self.ownedNFTs <- {}
    }
  }

  pub fun createEmptyCollection(): @Collection {
    return <-create self.Collection()
  }


  pub fun mintCard(templateID: UInt32, paymentVault: @FungibleToken.Vault): @Card {
    pre {
      self.templates[templateID] != nil : "Could not mint card: card with given ID does not exist."
      paymentVault.balance >= self.templates[templateID]!.price : "Could not mint card: payment balance insufficient."
    }
    destroy paymentVault
    return <- create Card(templateID: templateID)
  }


  pub fun mintCardFromPack(packID: UInt32, templateID: UInt32, paymentVault: @FungibleToken.Vault): @Card {
    pre {
      self.packs[packID] != nil : "Could not mint card from pack: pack does not exist."
      self.templates[templateID] != nil : "Could not mint card from pack: template does not exist."
    }
    let packRef = &self.packs[packID] as! &Pack
    if packRef.price > paymentVault.balance {
      panic("Could not mint card from pack: payment balance is not sufficient.")
    }
    destroy paymentVault
    return <- packRef.mintCard(templateID: templateID)
  }

  pub fun batchMintCardsFromPack(packID: UInt32, templateIDs: [UInt32], paymentVault: @FungibleToken.Vault): @Collection {
    pre {
      templateIDs.length > 0 : "Could not batch mint cards from pack: at least one templateID is required."
      templateIDs.length <= 5 : "Could not batch mint cards from pack: batch mint limit of 5 cards exceeded."
      self.packs[packID] != nil : "Could not batch mint cards from pack: pack does not exist."
    }

    let packRef = &self.packs[packID] as! &Pack
    if packRef.price > paymentVault.balance {
      panic("Could not batch mint card from pack: payment balance is not sufficient.")
    }
    let collection <- create Collection()

    for ID in templateIDs {
      if !self.packContainsTemplate(packID: packID, templateID: ID) {
        continue
      }
      collection.deposit(token: <- create Card(templateID: ID))
    }
    destroy paymentVault
    return <-collection
  }

  pub fun listTemplates(): {UInt32: Template} {
    return self.templates
  }

  pub fun listPacks(): [PackReport] {
    var packs: [PackReport] = []
    for key in self.packs.keys {
      let el = &self.packs[key] as &Pack
      packs.append(PackReport(
        name: el.name, 
        packID: el.packID, 
        templates: el.templates, 
        price: el.price
      ))
    }
    return packs
  }

  pub fun listPackTemplates(packID: UInt32): [UInt32] {
    pre {
      self.packs[packID] != nil : "Could not list pack templates: pack does not exist."
    }
    var report: [UInt32] = []
    let el = &self.packs[packID] as! &Pack
    for temp in el.templates {
      report.append(temp)
    }
    return report
  }

  pub fun getPack(packID: UInt32): PackReport {
    pre {
      self.packs[packID] != nil : "Could not get pack: pack does not exist."
    }
    let el = &self.packs[packID] as! &Pack
    let report = PackReport(
      name: el.name, 
      packID: el.packID, 
      templates: el.templates, 
      price: el.price
    )
    return report
  }


  pub fun packContainsTemplate(packID: UInt32, templateID: UInt32): Bool {
    pre {
      self.packs[packID] != nil : "pack does not exist"
    }
    let el = &self.packs[packID] as! &Pack
    return el.templates.contains(templateID)
  }

  init() {
    self.templates = {}
    self.totalCards = 0
    self.nextTemplateID = 1
    self.nextPackID = 1
    self.CollectionStoragePath = /storage/CLCollection
    self.CollectionPublicPath = /public/CLCollectionPublic
    self.AdminStoragePath = /storage/CLAdmin
    self.account.save<@Admin>(<- create Admin(), to: self.AdminStoragePath)
    self.packs <- {}
  }

}