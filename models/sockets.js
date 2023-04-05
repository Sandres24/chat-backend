const { comprobarJWT } = require('../helpers/jwt');
const { usuarioConectado, usuarioDesconectado, getUsuarios, grabarMensaje } = require('../controllers/sockets');

class Sockets {
  constructor(io) {
    this.io = io

    this.socketEvents()
  }

  socketEvents() {
    // On connection
    this.io.on('connection', async(socket) => {
      const  [ valido, uid ] = comprobarJWT( socket.handshake.query['x-token'] );

      if ( !valido ) {
        console.log('Socket no identificado');
        return socket.disconnect();
      }

      await usuarioConectado( uid );

      // Unir al usuario a una sala de socket.io
      socket.join( uid );

      // TODO: Validar el JWT
      // Si el token no es válido, desconectar

      // TODO: Saber qué usuario está activo mediante el UID

      // TODO: Emitir todos los usuarios conectados
      this.io.emit( 'lista-usuarios', await getUsuarios() );

      // TODO: Socket join

      // TODO: Escuchar cuando el cliente manda un mensaje
      socket.on( 'mensaje-personal', async( payload ) => {
        const mensaje = await grabarMensaje( payload );
        this.io.to( payload.para ).emit( 'mensaje-personal', mensaje );
        this.io.to( payload.de ).emit( 'mensaje-personal', mensaje );
      } );
      // mensaje-personal

      // TODO: Disconnect
      // Marcar en la DB que el usuario se desconectó

      // TODO: Emitir todos los usuarios conectados
      socket.on('disconnect', async() => {
        await usuarioDesconectado( uid );
        this.io.emit( 'lista-usuarios', await getUsuarios() );
      })
    })
  }
}

module.exports = Sockets
