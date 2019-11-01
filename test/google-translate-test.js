const chai = require('chai')
const sinon = require('sinon')

chai.use(require('sinon-chai'))

const expect = chai.expect

describe('google-translate', () => {
  let robot

  beforeEach(() => {
    robot = {
      respond: sinon.spy(),
      hear: sinon.spy()
    }

    require('../src/google-translate')(robot)
  })

  it('registers a respond listener', () => {
    expect(robot.respond).to.have.been.called()
  })
})
