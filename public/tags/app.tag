<app>
  <div id="app" class="mdl-layout mdl-js-layout mdl-layout--fixed-drawer mdl-layout--fixed-header">
    <header class="mdl-layout__header">
      <div class="mdl-layout__header-row">
        <div class="mdl-layout-spacer"></div>
        <div class="mdl-textfield mdl-js-textfield mdl-textfield--expandable mdl-textfield--floating-label mdl-textfield--align-right">
          <label class="mdl-button mdl-js-button mdl-button--icon" for="fixed-header-drawer-exp">
            <i class="material-icons">search</i>
          </label>
          <div class="mdl-textfield__expandable-holder">
            <input class="mdl-textfield__input" type="text" name="sample" id="fixed-header-drawer-exp">
          </div>
        </div>
      </div>
    </header>
    <div class="mdl-layout__drawer">
      <span class="mdl-layout-title">AWE2</span>
      <nav class="mdl-navigation">
        <a class="mdl-navigation__link" href="#" each={ menuItems } data-route={ route } onclick={ goto }>{ name }</a>
      </nav>
    </div>
    <main class="mdl-layout__content content">
      <div class="page-content" data-is={ component }></div>
    </main>
  </div>

  <script>
    var self = this;

    this.on('mount', function () {
      componentHandler.upgradeDom();
    });

    // this.component = 'welcome';

    this.menuItems = [
      {
        name: 'Intro',
        route: 'welcome'
      }, {
        name: 'Modules',
        route: 'modules'
      }, {
        name: 'Chat',
        route: 'chat'
      }
    ];

    route('/*', function (path) {
      self.component = path;
    });

    route.start();
    route.exec();

    goto(e) {
      event.preventDefault();
      route(e.target.dataset.route);
    }
  </script>

  <style>
    .content {
      background: #fafafa;
      padding: 2em;
    }

  </style>
</app>
