import Topographicprofile from 'facade/topographicprofile';

const map = M.map({
  container: 'mapjs',
});

const mp = new Topographicprofile();

map.addPlugin(mp);

window.map = map;
