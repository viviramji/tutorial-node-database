
const crypto = require('crypto')
const knex = require('knex')(require('./knexfile'))

module.exports = {
  saltHashPassword,
  //encrypt and write data to the user table
  createUser ({ username, password }) {
    console.log(`Add user ${username}`)
    const { salt, hash } = saltHashPassword(password)
    return knex('user').insert({
      salt,
      encrypted_password: hash,
      username
    })
  },
  //authenticate
  authenticate( { username, password }) {
    console.log(`Authenticating user ${username}`)
    return knex('user').where({username})
		.then(([user]) => {
			if(!user) return {success: false}
			const { hash } = saltHashPassword({
				password,
				salt: user.salt
			})
			return {success: hash === user.encrypted_password}
		})

  }
}

function saltHashPassword ({
	password,
	salt = randomString()
}) {
  const hash = crypto
    .createHmac('sha512', salt)
    .update(password)
  return {
    salt,
    hash: hash.digest('hex')
  }
}

function randomString () {
  return crypto.randomBytes(4).toString('hex')
}

//Write data to the user table whenever a createUser request is made
/*
module.exports = {
  createUser ({ username, password }) {
    console.log(`Add user ${username} with password ${password}`)
    return knex('user').insert({
      username,
      password
    })
  }
} */